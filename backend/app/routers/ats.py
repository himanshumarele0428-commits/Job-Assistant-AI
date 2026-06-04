from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app.models.ats_analysis import ATSAnalysis
from app.models.resume import Resume
from app.models.user import User
from app.schemas.ats import ATSAnalyzeRequest, ATSAnalysisResponse
from app.middleware.auth import get_current_user
from app.services.ats_service import analyze_ats

router = APIRouter(prefix="/ats", tags=["ats"])


@router.post("/analyze", response_model=ATSAnalysisResponse)
async def analyze(
    data: ATSAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    resume_result = await db.execute(
        select(Resume).where(Resume.id == data.resume_id, Resume.user_id == current_user.id)
    )
    resume = resume_result.scalar_one_or_none()
    if not resume or not resume.extracted_text:
        raise HTTPException(status_code=404, detail="Resume not found or has no text")

    try:
        result = analyze_ats(resume.extracted_text, data.jd_text, data.api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS analysis failed: {str(e)}")

    analysis = ATSAnalysis(
        user_id=current_user.id,
        resume_id=data.resume_id,
        job_id=data.job_id,
        jd_text=data.jd_text,
        overall_score=result["overall_score"],
        scores=result["scores"],
        keyword_analysis=result["keyword_analysis"],
        detailed_feedback=result["detailed_feedback"],
        summary=result["summary"],
        ats_readability_score=result["ats_readability_score"],
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis


@router.get("/history", response_model=list[ATSAnalysisResponse])
async def get_history(
    resume_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(ATSAnalysis).where(ATSAnalysis.user_id == current_user.id)
    if resume_id:
        query = query.where(ATSAnalysis.resume_id == resume_id)
    query = query.order_by(ATSAnalysis.created_at.desc()).limit(50)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{analysis_id}", response_model=ATSAnalysisResponse)
async def get_analysis(
    analysis_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ATSAnalysis).where(
            ATSAnalysis.id == str(analysis_id), ATSAnalysis.user_id == current_user.id
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
