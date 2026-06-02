from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreateRequest, JobUpdateRequest, JobResponse, JobListResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "date_applied",
    sort_order: Optional[str] = "desc",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Job).where(Job.user_id == current_user.id)
    count_query = select(func.count(Job.id)).where(Job.user_id == current_user.id)

    if status:
        query = query.where(Job.status == status)
        count_query = count_query.where(Job.status == status)
    if search:
        like = f"%{search}%"
        query = query.where((Job.title.ilike(like)) | (Job.company.ilike(like)))
        count_query = count_query.where((Job.title.ilike(like)) | (Job.company.ilike(like)))

    sort_col = getattr(Job, sort_by, Job.date_applied)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    total = (await db.execute(count_query)).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    jobs = (await db.execute(query)).scalars().all()

    return JobListResponse(total=total, page=page, page_size=page_size, items=jobs)


@router.post("/", response_model=JobResponse, status_code=201)
async def create_job(
    data: JobCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    job = Job(user_id=current_user.id, **data.model_dump(exclude_none=True))
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == current_user.id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    data: JobUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == current_user.id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(job, key, value)
    await db.commit()
    await db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == current_user.id)
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.delete(job)
    await db.commit()


@router.get("/stats/status-counts")
async def job_status_counts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Job.status, func.count(Job.id))
        .where(Job.user_id == current_user.id)
        .group_by(Job.status)
    )
    rows = (await db.execute(query)).all()
    return {status: count for status, count in rows}
