from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError
from app.database import init_db
from app.config import get_settings
from app.routers import auth, jobs, resumes, ats, cover_letter, reminders, dashboard, admin, search, reports
from app.services.reminder_scheduler import start_scheduler, stop_scheduler

import logging
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Job Assistant AI",
    description="AI-powered Job Application Tracking and Career Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefix = settings.api_v1_prefix

app.include_router(auth.router, prefix=prefix)
app.include_router(jobs.router, prefix=prefix)
app.include_router(resumes.router, prefix=prefix)
app.include_router(ats.router, prefix=prefix)
app.include_router(cover_letter.router, prefix=prefix)
app.include_router(reminders.router, prefix=prefix)
app.include_router(dashboard.router, prefix=prefix)
app.include_router(admin.router, prefix=prefix)
app.include_router(search.router, prefix=prefix)
app.include_router(reports.router, prefix=prefix)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred. Please try again."},
    )


@app.get("/")
async def root():
    return {"status": "ok", "service": "Job Assistant AI", "docs": "/docs"}
