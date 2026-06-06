# Job Assistant AI

AI-powered Job Application Tracking and Career Assistant platform. Track applications, analyze resumes with ATS scoring, generate cover letters, search jobs, and manage reminders — all with a premium SaaS-style interface.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Tech Stack](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript) ![Tech Stack](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi) ![Tech Stack](https://img.shields.io/badge/Python-3.12-3776AB?logo=python) ![Tech Stack](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss) ![Tech Stack](https://img.shields.io/badge/Groq-llama--3.3--70b-FF6B00)

---

## Features

###  Dashboard & Analytics
- Stats cards: total applications, interviews, offers, average ATS score
- Charts: monthly applications (bar), status distribution (pie), ATS trend (line), top companies (horizontal bar)
- Recent activity feed

###  Job Management
- Full CRUD with search, filter by status, pagination
- 10-stage workflow: Draft → Applied → In Progress → Interview → Technical Round → HR Round → Selected → Offer → Rejected → Done
- Skills tagging, salary tracking, work mode (remote/hybrid/onsite)

###  Resume Repository
- Upload PDF/DOCX up to 20MB
- Automatic text extraction
- Version tracking, preview, download

###  ATS Resume Checker
- Powered by **Groq llama-3.3-70b-versatile**
- 5-dimension scoring: Effectivity, Layout & Design, Content Relevance, Grammar & Syntax, Impact
- Keyword analysis (matched vs missing keywords)
- Strengths & improvement recommendations
- ATS Readability Score calculation
- Analysis history

### ✉️ AI Cover Letter Generator
- Personalized, ATS-friendly cover letters
- PDF download via ReportLab
- Edit and preview before downloading

###  Job Search
- External job API integration (Adzuna)
- AI-powered job suggestions based on your resume

### ⏰ Reminders
- Interview, follow-up, and deadline reminders
- **No-credentials in-app notifications** — browser notifications, audio chime, and animated toast alerts with zero SMTP setup
- Email support via SMTP (Gmail with App Password, SendGrid) or Ethereal test service
- APScheduler-based processing (runs in-process, no Celery/Redis needed)

###  Reports & History
- Application timeline by month
- Conversion rate analytics
- **Export to CSV** (downloadable spreadsheet with Title, Company, Status, Location, Skills)
- **Export to PDF** (styled report with header table via ReportLab)
- Delete reminders (sent and unsent) from the Reminders page

###  Admin Panel
- User management
- Platform statistics
- System audit logs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite, Redux Toolkit, React Router, React Query, Recharts, Framer Motion, Lucide React |
| **Backend** | FastAPI (Python 3.12), SQLAlchemy 2.0, Pydantic, Celery, JWT |
| **Database** | PostgreSQL (production) / SQLite (development) |
| **AI** | Groq API (llama-3.3-70b-versatile), OpenAI (optional) |
| **Infrastructure** | Docker, docker-compose, Nginx, Redis |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- (Optional) Docker & Docker Compose

### Development Setup

**1. Clone and install dependencies**

```bash
# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example .env

# Frontend
cd ../frontend
npm install
```

**2. Set environment variables**

Edit `.env` and configure at minimum:
```env
DATABASE_URL=sqlite+aiosqlite:///./job_assistant.db   # For dev (default)
SECRET_KEY=your-secret-key
GROQ_API_KEY=gsk_your_key_here                         # Required for AI features

# Optional — for real email delivery (Gmail SMTP):
# 1. Enable 2FA on Gmail: https://myaccount.google.com/security
# 2. Create App Password: https://myaccount.google.com/apppasswords
# 3. Uncomment and fill below:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-16-char-app-password
```

**Note**: Email credentials are optional. Set reminders to "In-App" notification type for zero-config desktop alerts.

**3. Start the servers**

```bash
# Terminal 1 — Backend (port 8002)
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

**4. Open the app**

- Frontend: **[http://localhost:3000](http://localhost:3000)**
- API Docs: **[http://localhost:8002/docs](http://localhost:8002/docs)**

### Docker Setup

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, backend, Celery worker, Celery beat, and frontend.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/` | List jobs (pagination, filters) |
| POST | `/api/jobs/` | Create job |
| GET | `/api/jobs/{id}` | Get job details |
| PUT | `/api/jobs/{id}` | Update job |
| DELETE | `/api/jobs/{id}` | Delete job |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload PDF/DOCX |
| GET | `/api/resumes/` | List resumes |
| GET | `/api/resumes/{id}/download` | Download resume file |
| DELETE | `/api/resumes/{id}` | Delete resume |

### ATS Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ats/analyze` | Run ATS analysis |
| GET | `/api/ats/history` | View analysis history |
| GET | `/api/ats/{id}` | Get single analysis |

### Cover Letters
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cover-letter/generate` | Generate cover letter |
| GET | `/api/cover-letter/` | List all |
| GET | `/api/cover-letter/{id}/download/pdf` | Download as PDF |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard stats |
| GET | `/api/dashboard/charts/monthly` | Monthly applications |
| GET | `/api/dashboard/charts/companies` | Company breakdown |
| GET | `/api/dashboard/charts/ats-trend` | ATS score trend |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/monthly` | Monthly application report |
| GET | `/api/reports/export/csv` | Download jobs as CSV |
| GET | `/api/reports/export/pdf` | Download jobs as styled PDF |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders/` | List reminders |
| GET | `/api/reminders/?due=true` | Get due in-app reminders (marks as sent) |
| POST | `/api/reminders/` | Create reminder |
| PUT | `/api/reminders/{id}` | Update reminder |
| PUT | `/api/reminders/{id}/ack` | Acknowledge/dismiss a reminder |
| DELETE | `/api/reminders/{id}` | Delete reminder |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/stats` | Platform statistics |

---

## Project Structure

```
Project30_JobAssistantAI/
├── docker-compose.yml
├── .env.example
├── .env                          # Environment config
├── start_backend.bat             # Windows quick-launch scripts
├── start_frontend.bat
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py               # FastAPI entry point
│       ├── config.py             # Settings (pydantic-settings)
│       ├── database.py           # SQLAlchemy engine + session
│       ├── models/               # ORM models (Job, Resume, CoverLetter, Reminder, etc.)
│       ├── schemas/              # Pydantic request/response schemas
│       ├── routers/              # API route handlers (auth, jobs, resumes, ats, cover_letter, reminders, reports, etc.)
│       ├── services/             # Business logic (AI generation, email_service, reminder_scheduler)
│       ├── middleware/           # JWT auth middleware
│       └── tasks/                # Celery tasks (optional)
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── api/                  # Axios API client + endpoint modules
│       ├── store/                # Redux Toolkit slices (auth, ui)
│       ├── components/
│       │   └── layout/           # Sidebar, Header, DashboardLayout, ReminderNotifier
│       ├── pages/                # Page components (Dashboard, Jobs, Reminders, Reports, etc.)
│       ├── router/               # React Router + ProtectedRoute
│       └── styles/               # Tailwind + custom CSS
└── prompt.md                     # PRD document
```

---

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `sqlite+aiosqlite:///...` | Database connection URL |
| `SECRET_KEY` | Yes | — | JWT signing secret |
| `GROQ_API_KEY` | For AI features | — | Groq API key for ATS/Cover Letter |
| `SMTP_HOST` | For email | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | For email | `587` | SMTP port (TLS) |
| `SMTP_USERNAME` | For email | — | SMTP login (Gmail address) |
| `SMTP_PASSWORD` | For email | — | SMTP password (Gmail App Password) |
| `SENDGRID_API_KEY` | For email | — | SendGrid API key (alternative) |
| `REDIS_URL` | No longer required | — | Reminders use in-process scheduler |
| `STORAGE_TYPE` | No | `local` | File storage: `local` or `s3` |

---

## AI Model

- **Provider**: Groq
- **Model**: `llama-3.3-70b-versatile`
- **Temperature**: 0.3 (ATS), 0.7 (Cover Letters)
- **Max Tokens**: 2048 (ATS), 1024 (Cover Letters)

Default ATS scoring uses Groq. OpenAI can be added as an alternative provider.

---
