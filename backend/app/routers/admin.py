from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.audit_log import AuditLog
from app.middleware.auth import get_admin_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(100))
    return result.scalars().all()


@router.get("/stats")
async def platform_stats(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_jobs = (await db.execute(select(func.count(Job.id)))).scalar() or 0

    status_query = (
        select(Job.status, func.count(Job.id)).group_by(Job.status)
    )
    status_counts = {s: c for s, c in (await db.execute(status_query)).all()}

    return {
        "total_users": total_users,
        "total_jobs": total_jobs,
        "jobs_by_status": status_counts,
    }


@router.get("/logs")
async def system_logs(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100)
    )
    return result.scalars().all()
