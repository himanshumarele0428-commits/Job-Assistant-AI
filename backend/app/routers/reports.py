from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/monthly")
async def monthly_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jobs_result = await db.execute(
        select(Job)
        .where(Job.user_id == current_user.id)
        .order_by(Job.date_applied.desc())
    )
    jobs = jobs_result.scalars().all()
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
