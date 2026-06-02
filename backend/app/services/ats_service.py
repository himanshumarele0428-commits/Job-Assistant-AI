import json
import re
from groq import Groq
from app.config import get_settings

settings = get_settings()

ATS_PROMPT_TEMPLATE = """You are an expert ATS (Applicant Tracking System) analyst. Analyze the following resume against the job description provided.

## RESUME TEXT:
{resume_text}

## JOB DESCRIPTION:
{jd_text}

Perform a thorough ATS analysis and return your response as valid JSON only (no markdown, no backticks). Use this exact structure:

{{
  "scores": {{
    "effectivity": {{"score": "0-10", "label": "Effectivity"}},
    "layout_design": {{"score": "0-10", "label": "Layout & Design"}},
    "content_relevance": {{"score": "0-10", "label": "Content Relevance"}},
    "grammar_syntax": {{"score": "0-10", "label": "Grammar & Syntax"}},
    "impact": {{"score": "0-10", "label": "Impact"}}
  }},
  "keyword_analysis": {{
    "matched_keywords": ["keyword1", "keyword2"],
    "missing_keywords": ["keyword3", "keyword4"],
    "match_percentage": "0-100"
  }},
  "detailed_feedback": {{
    "strengths": ["✅ strength 1", "✅ strength 2"],
    "improvements": ["🙈 improvement 1", "🙈 improvement 2"]
  }},
  "summary": "<2-3 sentence overall assessment>"
}}

Rules:
- Score each dimension honestly on a scale of 0-10 where 0=terrible and 10=perfect.
- For strengths, prefix each item with ✅. For improvements, prefix each item with 🙈.
- Extract key technical skills, tools, and qualifications from the JD and check which appear in the resume.
- The "layout_design" score refers to visual appeal, organization, readability for human recruiters.
- Return ONLY the JSON object, nothing else. No markdown fences, no explanation."""


def _clean_json_response(raw: str) -> str:
    cleaned = re.sub(r"```(json)?\s*", "", raw)
    cleaned = re.sub(r"\s*```", "", cleaned)
    return cleaned.strip()


def _calculate_overall_score(scores: dict) -> float:
    vals = []
    for dim in ["effectivity", "layout_design", "content_relevance", "grammar_syntax", "impact"]:
        try:
            vals.append(float(scores[dim]["score"]))
        except (KeyError, ValueError, TypeError):
            vals.append(0)
    return round(sum(vals) / len(vals), 1)


def _calculate_ats_readability(scores: dict, match_pct: float) -> float:
    layout = float(scores.get("layout_design", {}).get("score", 0))
    content = float(scores.get("content_relevance", {}).get("score", 0))
    raw = (layout * 4) + (content * 3) + (match_pct * 0.3)
    return max(0, min(100, round(raw, 1)))


def analyze_ats(resume_text: str, jd_text: str, api_key: str) -> dict:
    client = Groq(api_key=api_key)
    prompt = ATS_PROMPT_TEMPLATE.format(resume_text=resume_text, jd_text=jd_text)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2048,
    )
    raw = response.choices[0].message.content or "{}"
    cleaned = _clean_json_response(raw)
    parsed = json.loads(cleaned)

    scores = parsed.get("scores", {})
    keyword = parsed.get("keyword_analysis", {})
    match_pct = float(keyword.get("match_percentage", 0))

    overall = _calculate_overall_score(scores)
    readability = _calculate_ats_readability(scores, match_pct)

    return {
        "scores": scores,
        "keyword_analysis": keyword,
        "detailed_feedback": parsed.get("detailed_feedback", {}),
        "summary": parsed.get("summary", ""),
        "overall_score": overall,
        "ats_readability_score": readability,
    }
