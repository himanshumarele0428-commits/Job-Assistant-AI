from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.middleware.auth import get_current_user
from app.services.job_search_service import search_jobs
from app.config import get_settings

router = APIRouter(prefix="/search", tags=["search"])
settings = get_settings()


@router.get("/jobs")
async def search_external_jobs(
    title: str = Query(None),
    location: str = Query(None),
    skills: str = Query(None),
    remote: bool = Query(False),
    page: int = Query(1, ge=1),
    current_user: User = Depends(get_current_user),
):
    try:
        results = search_jobs(
            title=title,
            location=location,
            skills=skills,
            remote=remote,
            page=page,
            app_id=settings.adzuna_app_id,
            app_key=settings.adzuna_app_key,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job search failed: {str(e)}")


@router.get("/suggestions")
async def job_suggestions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    resume_result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id, Resume.extracted_text.isnot(None))
        .order_by(Resume.created_at.desc())
        .limit(1)
    )
    resume = resume_result.scalar_one_or_none()
    skills_param = current_user.job_title or ""
    if resume and resume.extracted_text:
        words = resume.extracted_text.split()[:200]
        skills_param = " ".join(words)

    try:
        results = search_jobs(
            title=current_user.job_title,
            skills=skills_param,
            page=1,
            app_id=settings.adzuna_app_id,
            app_key=settings.adzuna_app_key,
        )
        return results
    except Exception:
        return {"items": [], "total": 0, "message": "Job search API not configured"}
