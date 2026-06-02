from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.config import get_settings
from app.routers import auth, jobs, resumes, ats, cover_letter, reminders, dashboard, admin, search, reports

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


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


@app.get("/")
async def root():
    return {"status": "ok", "service": "Job Assistant AI", "docs": "/docs"}
