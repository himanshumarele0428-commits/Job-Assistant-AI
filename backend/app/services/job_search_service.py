import httpx
from typing import Optional


def search_jobs(
    title: Optional[str] = None,
    location: Optional[str] = None,
    skills: Optional[str] = None,
    remote: bool = False,
    page: int = 1,
    app_id: Optional[str] = None,
    app_key: Optional[str] = None,
) -> dict:
    if not app_id or not app_key:
        return {"items": [], "total": 0, "message": "Job search API not configured. Set ADZUNA credentials."}

    what = title or skills or ""
    where = location or ""
    url = f"https://api.adzuna.com/v1/api/jobs/us/search/{page}"
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "what": what,
        "where": where,
        "results_per_page": 20,
        "content-type": "application/json",
    }

    with httpx.Client(timeout=15) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    items = []
    for r in data.get("results", []):
        items.append({
            "id": r.get("id"),
            "title": r.get("title", ""),
            "company": r.get("company", {}).get("display_name", ""),
            "location": ", ".join(r.get("location", {}).get("area", [])),
            "description": r.get("description", ""),
            "url": r.get("redirect_url", ""),
            "salary": r.get("salary_min") and f"${r['salary_min']} - ${r['salary_max']}",
            "remote": "remote" in (r.get("description", "") or "").lower(),
        })

    return {"items": items, "total": data.get("count", 0)}
