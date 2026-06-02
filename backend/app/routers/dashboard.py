from fastapi import APIRouter, Depends
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.models.ats_analysis import ATSAnalysis
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    statuses = ["draft", "applied", "in_progress", "interview_scheduled", "selected", "rejected", "offer_received", "done"]
    counts = {}
    for s in statuses:
        result = await db.execute(
            select(func.count(Job.id)).where(Job.user_id == current_user.id, Job.status == s)
        )
        counts[s] = result.scalar() or 0

    total_result = await db.execute(
        select(func.count(Job.id)).where(Job.user_id == current_user.id)
    )
    total = total_result.scalar() or 0

    ats_result = await db.execute(
        select(func.avg(ATSAnalysis.overall_score)).where(ATSAnalysis.user_id == current_user.id)
    )
    avg_ats = ats_result.scalar() or 0

    return {
        "total_jobs": total,
        "by_status": counts,
        "average_ats_score": round(float(avg_ats), 1),
        "interviews": counts.get("interview_scheduled", 0),
        "offers": counts.get("offer_received", 0),
    }


@router.get("/charts/monthly")
async def monthly_applications(
    year: int = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not year:
        year = datetime.utcnow().year
    result = await db.execute(
        select(extract("month", Job.created_at), func.count(Job.id))
        .where(Job.user_id == current_user.id, extract("year", Job.created_at) == year)
        .group_by(extract("month", Job.created_at))
        .order_by(extract("month", Job.created_at))
    )
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    data = {m: 0 for m in months}
    for month_num, count in result.all():
        idx = int(month_num) - 1
        if 0 <= idx < 12:
            data[months[idx]] = count
    return {"year": year, "data": [{"month": k, "count": v} for k, v in data.items()]}


@router.get("/charts/companies")
async def company_breakdown(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Job.company, func.count(Job.id))
        .where(Job.user_id == current_user.id)
        .group_by(Job.company)
        .order_by(func.count(Job.id).desc())
        .limit(10)
    )
    return [{"company": company, "count": count} for company, count in result.all()]


@router.get("/charts/ats-trend")
async def ats_trend(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ATSAnalysis.created_at, ATSAnalysis.overall_score)
        .where(ATSAnalysis.user_id == current_user.id)
        .order_by(ATSAnalysis.created_at.desc())
        .limit(30)
    )
    return [
        {"date": created_at.isoformat(), "score": score}
        for created_at, score in result.all()
    ]


@router.get("/activity")
async def recent_activity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jobs_result = await db.execute(
        select(Job).where(Job.user_id == current_user.id).order_by(Job.updated_at.desc()).limit(10)
    )
    jobs = jobs_result.scalars().all()
    return [
        {
            "type": "job",
            "id": str(j.id),
            "title": j.title,
            "company": j.company,
            "status": j.status,
            "date": j.updated_at.isoformat(),
        }
        for j in jobs
    ]
