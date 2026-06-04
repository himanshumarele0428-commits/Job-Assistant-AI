import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.cover_letter import CoverLetter
from app.models.resume import Resume
from app.models.user import User
from app.schemas.cover_letter import CoverLetterGenerateRequest, CoverLetterResponse
from app.middleware.auth import get_current_user
from app.services.cover_letter_service import generate_cover_letter
from app.config import get_settings
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

settings = get_settings()
router = APIRouter(prefix="/cover-letter", tags=["cover-letter"])


@router.post("/generate", response_model=CoverLetterResponse, status_code=201)
async def generate(
    data: CoverLetterGenerateRequest,
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
        content = generate_cover_letter(
            resume.extracted_text, data.jd_text, data.company_name, data.hiring_manager, data.api_key
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")

    letter = CoverLetter(
        user_id=current_user.id,
        resume_id=data.resume_id,
        job_id=data.job_id,
        company_name=data.company_name,
        hiring_manager=data.hiring_manager,
        jd_text=data.jd_text,
        content=content,
    )
    db.add(letter)
    await db.commit()
    await db.refresh(letter)
    return letter


@router.get("/", response_model=list[CoverLetterResponse])
async def list_letters(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CoverLetter)
        .where(CoverLetter.user_id == current_user.id)
        .order_by(CoverLetter.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{letter_id}", response_model=CoverLetterResponse)
async def get_letter(
    letter_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == str(letter_id), CoverLetter.user_id == current_user.id
        )
    )
    letter = result.scalar_one_or_none()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return letter


@router.get("/{letter_id}/download/pdf")
async def download_pdf(
    letter_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == str(letter_id), CoverLetter.user_id == current_user.id
        )
    )
    letter = result.scalar_one_or_none()
    if not letter or not letter.content:
        raise HTTPException(status_code=404, detail="Cover letter not found")

    upload_dir = os.path.join(settings.local_storage_path, str(current_user.id), "cover_letters")
    os.makedirs(upload_dir, exist_ok=True)
    pdf_path = os.path.join(upload_dir, f"{letter_id}.pdf")

    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    paragraphs = [Paragraph(p.replace("\n", "<br/>"), styles["Normal"]) for p in letter.content.split("\n\n") if p.strip()]
    doc.build(paragraphs)

    return FileResponse(pdf_path, media_type="application/pdf", filename=f"cover_letter_{letter.company_name}.pdf")


@router.delete("/{letter_id}", status_code=204)
async def delete_letter(
    letter_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == str(letter_id), CoverLetter.user_id == current_user.id
        )
    )
    letter = result.scalar_one_or_none()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    await db.delete(letter)
    await db.commit()
