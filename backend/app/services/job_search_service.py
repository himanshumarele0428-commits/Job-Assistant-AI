import httpx
import re
import random
import logging
from typing import Optional
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
]

JOB_SITES = [
    "indeed.com", "linkedin.com/jobs", "glassdoor.com", "monster.com",
    "ziprecruiter.com", "simplyhired.com", "careerbuilder.com",
    "dice.com", "wellfound.com", "remoteok.com", "weworkremotely.com",
    "levels.fyi", "builtin.com", "flexjobs.com", "turing.com",
]


def _get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }


def _build_query(title: Optional[str], location: Optional[str], skills: Optional[str], remote: bool) -> str:
    parts = []
    if title:
        parts.append(title.strip())
    if skills:
        parts.append(skills.strip())
    if parts:
        parts.append("jobs")
    else:
        parts.append("software engineer jobs")
    if location:
        parts.append(location.strip())
    if remote:
        parts.append("remote")
    query = " ".join(parts).strip()
    logger.info(f"Built search query: {query}")
    return query


def _parse_google_snippet(text: str) -> dict:
    location = ""
    company = ""

    loc_match = re.search(r'(?:in|at)\s+([A-Z][a-zA-Z\s,]+?)(?:\s*[-–·•]|\s*$|\s+\d|\s+\$)', text)
    if loc_match:
        location = loc_match.group(1).strip().rstrip(" ,")

    comp_patterns = [
        r'(?:at|with|@)\s+([A-Z][A-Za-z0-9\s&\.\-]+?)(?:\s*(?:in|,|is|has|\-|·|•|\d|$))',
        r'^([A-Z][A-Za-z0-9\s&\.\-]+?)\s*(?:is|has|looking|hiring|seeking)',
    ]
    for pat in comp_patterns:
        m = re.search(pat, text)
        if m:
            candidate = m.group(1).strip()
            if len(candidate.split()) <= 5 and candidate.lower() not in ("jobs", "job", "careers", "apply", "hiring"):
                company = candidate
                break

    salary = ""
    sal_match = re.search(r'\$[\d,]+(?:[kK])?\s*[-–]\s*\$?[\d,]+(?:[kK])?(?:\s*(?:a year|per year|/yr|annually))?', text)
    if sal_match:
        salary = sal_match.group(0)

    return {"company": company, "location": location, "salary": salary}


def _search_duckduckgo(query: str, page: int = 1) -> list[dict]:
    """Search DuckDuckGo HTML endpoint - more permissive than Google."""
    headers = _get_headers()
    params = {
        "q": query,
        "s": (page - 1) * 25,
        "dcp": "1",
        "kl": "us-en",
    }
    try:
        resp = httpx.get(
            "https://html.duckduckgo.com/html/",
            params=params,
            headers=headers,
            timeout=15,
            follow_redirects=True,
        )
        resp.raise_for_status()
    except Exception as e:
        logger.error(f"DuckDuckGo request failed: {e}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    results = []

    for result_div in soup.select(".result"):
        title_el = result_div.select_one(".result__title a, .result__a")
        snippet_el = result_div.select_one(".result__snippet")
        url_el = result_div.select_one(".result__url")

        if not title_el:
            continue

        title = title_el.get_text(strip=True)
        url = url_el.get_text(strip=True).lstrip("://") if url_el else ""
        full_url = title_el.get("href", "")
        if full_url.startswith("//"):
            full_url = "https:" + full_url
        snippet = snippet_el.get_text(strip=True) if snippet_el else ""
        extracted = _parse_google_snippet(snippet)

        results.append({
            "id": str(hash(full_url or title)),
            "title": title,
            "company": extracted["company"] or _extract_domain_name(full_url),
            "location": extracted["location"],
            "description": snippet[:500],
            "url": full_url,
            "salary": extracted["salary"],
        })

    return results


def _search_google(query: str, page: int = 1) -> list[dict]:
    """Scrape Google search results. Falls back to DuckDuckGo on failure."""
    headers = _get_headers()
    params = {
        "q": query,
        "start": (page - 1) * 10,
        "hl": "en",
        "gl": "us",
    }
    try:
        resp = httpx.get(
            "https://www.google.com/search",
            params=params,
            headers=headers,
            timeout=10,
            follow_redirects=True,
        )
        resp.raise_for_status()
    except Exception as e:
        logger.warning(f"Google search failed ({e}), falling back to DuckDuckGo")
        return _search_duckduckgo(query, page)

    soup = BeautifulSoup(resp.text, "html.parser")
    results = []

    for g_div in soup.select("div.g, div[data-sokoban-container]"):
        title_el = g_div.select_one("h3")
        link_el = g_div.select_one("a[href^='http']")
        snippet_els = g_div.select("div[data-sncf], span.aCOpRe, div.VwiC3b")

        if not title_el:
            continue

        title = title_el.get_text(strip=True)
        url = link_el["href"] if link_el else ""
        snippet = " ".join(el.get_text(strip=True) for el in snippet_els) if snippet_els else ""
        extracted = _parse_google_snippet(snippet)

        results.append({
            "id": str(hash(url or title)),
            "title": title,
            "company": extracted["company"] or _extract_domain_name(url),
            "location": extracted["location"],
            "description": snippet[:500],
            "url": url,
            "salary": extracted["salary"],
        })

    if not results:
        logger.warning("Google returned no parseable results, falling back to DuckDuckGo")
        return _search_duckduckgo(query, page)

    return results


def _extract_domain_name(url: str) -> str:
    """Extract a clean company-like name from a URL."""
    if not url:
        return ""
    domain = re.sub(r'^https?://(www\.)?', '', url)
    domain = domain.split('/')[0]
    name = domain.split('.')[0]
    if len(name) > 20:
        name = name.split('.')[0]
    return name.title().replace('-', ' ').replace('_', ' ')


def search_jobs(
    title: Optional[str] = None,
    location: Optional[str] = None,
    skills: Optional[str] = None,
    remote: bool = False,
    page: int = 1,
    app_id: Optional[str] = None,
    app_key: Optional[str] = None,
) -> dict:
    """
    Search for jobs using Google/DuckDuckGo search engines.
    Falls back to DuckDuckGo if Google blocks the request.
    """
    query = _build_query(title, location, skills, remote)

    try:
        results = _search_google(query, page)
        logger.info(f"Found {len(results)} results for query: {query}")
        return {"items": results, "total": len(results)}
    except Exception as e:
        logger.error(f"Job search failed: {e}")
        return {"items": [], "total": 0, "message": f"Search failed: {str(e)}"}
