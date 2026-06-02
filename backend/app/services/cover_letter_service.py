from groq import Groq

COVER_LETTER_PROMPT = """You are a professional career coach and copywriter. Write a compelling, ATS-friendly cover letter.

## RESUME:
{resume_text}

## JOB DESCRIPTION:
{jd_text}

## COMPANY: {company_name}
## HIRING MANAGER: {hiring_manager}

Guidelines:
- Personalize deeply — reference specific skills from the resume that match the job description.
- Address the hiring manager by name if provided, otherwise use "Hiring Team".
- Keep it professional, warm, and confident.
- Structure: Opening hook → Why you're a fit (2-3 specific match points) → Why this company → Call to action.
- Include placeholders for [Your Name], [Phone], [Email], [LinkedIn] at the top.
- Return the cover letter as plain text (no markdown, no extra commentary)."""


def generate_cover_letter(
    resume_text: str,
    jd_text: str,
    company_name: str,
    hiring_manager: str | None,
    api_key: str,
) -> str:
    client = Groq(api_key=api_key)
    manager = hiring_manager or "Hiring Team"
    prompt = COVER_LETTER_PROMPT.format(
        resume_text=resume_text,
        jd_text=jd_text,
        company_name=company_name,
        hiring_manager=manager,
    )
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content or ""
