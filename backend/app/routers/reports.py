import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.middleware.auth import get_current_user
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

router = APIRouter(prefix="/reports", tags=["reports"])


async def _get_user_jobs(current_user: User, db: AsyncSession):
    result = await db.execute(
        select(Job)
        .where(Job.user_id == current_user.id)
        .order_by(Job.date_applied.desc())
    )
    return result.scalars().all()


@router.get("/monthly")
async def monthly_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jobs = await _get_user_jobs(current_user, db)
    return {
        "total": len(jobs),
        "applications": [
            {
                "title": j.title,
                "company": j.company,
                "status": j.status,
                "date_applied": j.date_applied.isoformat() if j.date_applied else None,
            }
            for j in jobs
        ],
    }


@router.get("/export/csv")
async def export_csv(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jobs = await _get_user_jobs(current_user, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Title", "Company", "Status", "Location", "Work Mode", "Date Applied", "Skills"])
    for j in jobs:
        skills = ", ".join(j.skills_required) if j.skills_required else ""
        writer.writerow([
            j.title,
            j.company,
            j.status.replace("_", " ").title(),
            j.location or "",
            j.work_mode or "",
            j.date_applied.isoformat() if j.date_applied else "",
            skills,
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=job_applications.csv"},
    )


@router.get("/export/pdf")
async def export_pdf(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jobs = await _get_user_jobs(current_user, db)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("Title_Header", parent=styles["Heading1"], fontSize=18, spaceAfter=12)
    elements = [
        Paragraph(f"Job Applications Report — {current_user.full_name}", title_style),
        Paragraph(f"Total Applications: {len(jobs)}", styles["Normal"]),
        Spacer(1, 16),
    ]

    table_data = [["Title", "Company", "Status", "Location", "Date Applied"]]
    for j in jobs:
        table_data.append([
            j.title[:40] + "..." if len(j.title) > 40 else j.title,
            j.company[:30] + "..." if len(j.company) > 30 else j.company,
            j.status.replace("_", " ").title(),
            j.location or "—",
            j.date_applied.isoformat() if j.date_applied else "—",
        ])

    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)

    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=job_applications_report.pdf"},
    )
