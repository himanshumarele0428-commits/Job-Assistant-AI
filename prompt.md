# PROJECT REQUIREMENT DOCUMENT (PRD)

## Project Name

Job Assistant AI

## Project Objective

Build a modern AI-powered Job Application Tracking and Career Assistant platform that helps job seekers manage applications, track progress, analyze resumes, generate ATS-friendly cover letters, search jobs from the internet, receive reminders, and improve hiring success.

The application should provide a premium user experience with modern UI/UX, responsive design, AI-powered features, analytics dashboards, and cloud-ready architecture.

---

# Technology Stack

## Frontend

* React 19
* TypeScript
* Material UI / ShadCN UI
* Tailwind CSS
* React Query
* React Router
* Redux Toolkit
* Recharts
* Framer Motion
* React Hook Form
* Axios

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Celery
* APScheduler
* JWT Authentication

## Database

Primary:

* PostgreSQL

Optional:

* Google Sheets Integration (for backup/export)

## Storage

* Resume Files
* Cover Letter PDFs
* User Documents

Storage Options:

* AWS S3
* Azure Blob Storage
* Local Storage (Development)

## AI Services

* Groq API
* OpenAI API (Optional)
* Resume ATS Analysis
* Cover Letter Generation
* Resume Optimization Suggestions

---

# UI/UX Requirements

Create a premium SaaS-style interface.

## Color Theme

Primary:

* #2563EB (Blue)

Secondary:

* #7C3AED (Purple)

Accent:

* #14B8A6 (Teal)

Success:

* #22C55E

Warning:

* #F59E0B

Danger:

* #EF4444

Background:

* #F8FAFC

Dark Mode:

* Fully supported

---

# Authentication Module

## Features

### User Registration

Fields:

* Full Name
* Email
* Phone Number
* Password
* Confirm Password
* LinkedIn URL
* Current Location
* Current Job Title

Validation:

* Email verification
* Password strength checker
* Duplicate account prevention

### Login

* Email Login
* Password Login
* Remember Me
* Forgot Password

### Security

* JWT Authentication
* Refresh Tokens
* Role Based Access
* Session Management
* Audit Logs

---

# Dashboard

Create a highly visual dashboard.

## Dashboard Cards

Display:

* Total Jobs Applied
* In Progress
* Interview Scheduled
* Selected
* Rejected
* Offers Received
* Completed Applications

## Charts

* Application Status Distribution
* Monthly Applications
* Company-wise Applications
* ATS Score Trends
* Interview Success Rate

## Recent Activities Widget

Show:

* Newly Added Jobs
* Upcoming Interviews
* Follow-up Reminders
* ATS Analysis Results

---

# Job Management Module

Users should be able to:

## Create Job

Fields:

* Job Title
* Company Name
* Company Website
* Job Location
* Employment Type
* Remote/Hybrid/Onsite
* Expected Salary
* Experience Required
* Job Description
* Skills Required
* Application URL
* Resume Used
* Cover Letter Used
* Date Applied
* Notes

---

## Application Status Workflow

Status Options:

* Draft
* Applied
* In Progress
* Interview Scheduled
* Technical Round
* HR Round
* Selected
* Offer Received
* Rejected
* Done

Users should be able to:

* Create
* Update
* Delete
* Search
* Filter
* Sort

---

# Resume Management

## Resume Repository

Users can:

* Upload Resume
* Download Resume
* Replace Resume
* Archive Resume

Supported Formats:

* PDF
* DOCX

Store:

* Resume Name
* Version
* Upload Date
* ATS Score History

---

# ATS Resume Score Checker

Create a dedicated ATS Analysis module.

## Workflow

User uploads:

* Resume
* Job Description

System should:

1. Extract Resume Text
2. Extract Job Description
3. Send both to Groq AI
4. Generate ATS Analysis

---

## AI Model

Model:

llama-3.3-70b-versatile

Temperature:

0.3

Max Tokens:

2048

---

## ATS Prompt

Use the exact ATS prompt provided by the client.

Implement:

* JSON validation
* Response cleaning
* Error handling
* Retry mechanism

---

## ATS Output

Display:

### Scores

* Overall Score
* Effectivity
* Layout & Design
* Content Relevance
* Grammar & Syntax
* Impact

### Keyword Analysis

* Matched Keywords
* Missing Keywords
* Match Percentage

### Recommendations

Strengths:
✅

Improvements:
🙈

### ATS Analytics

Calculate:

Overall Score =
Average of 5 dimensions

ATS Readability Score =
(layout × 4) + (content relevance × 3) + (keyword match % × 0.3)

Clamp between 0-100.

---

# AI Cover Letter Generator

## Inputs

* Resume
* Job Description
* Company Name
* Hiring Manager (optional)

## AI Output

Generate:

* Personalized Cover Letter
* ATS Friendly
* Professional Format

Features:

* Edit
* Preview
* Download PDF
* Download DOCX

---

# Job Search Module

Integrate real-time job search APIs.

Possible Sources:

* LinkedIn Jobs
* Indeed
* Adzuna
* RapidAPI Job APIs
* Google Jobs

---

## Search Filters

* Job Title
* Skills
* Location
* Salary
* Remote
* Company

---

## Auto Job Suggestions

Based on:

* Resume Skills
* Previous Applications
* ATS Results

AI should recommend relevant jobs.

---

# Reminder System

Users can create reminders for:

* Interview Dates
* Follow-Ups
* Application Deadlines

---

## Reminder Types

* Email Notification
* In-App Notification

---

## Scheduler

Use:

* APScheduler
* Celery

---

# Email Notification System

Use:

* SendGrid
  or
* SMTP

Email Types:

* Reminder Emails
* Status Updates
* ATS Reports
* Cover Letter Exports

---

# Application History Module

Left Sidebar Menu:

History

Show:

* All Previous Applications
* Timeline View
* Status Changes
* Notes
* Resume Versions

---

# Reports & Analytics

Generate reports:

* Monthly Applications
* ATS Improvement Trend
* Interview Conversion Rate
* Rejection Analysis

Export:

* PDF
* Excel
* CSV

---

# Admin Module

Admin Features:

* User Management
* Analytics Dashboard
* System Logs
* Job Statistics
* Email Monitoring

---

# APIs

Create complete REST APIs.

Authentication:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/forgot-password

---

Jobs:

GET /api/jobs

POST /api/jobs

PUT /api/jobs/{id}

DELETE /api/jobs/{id}

GET /api/jobs/search

---

ATS:

POST /api/ats/analyze

GET /api/ats/history

---

Cover Letter:

POST /api/cover-letter/generate

GET /api/cover-letter/download

---

Reminders:

POST /api/reminders

GET /api/reminders

PUT /api/reminders/{id}

DELETE /api/reminders/{id}

---

# Non-Functional Requirements

Performance:

* API Response < 2 seconds
* ATS Analysis < 15 seconds

Security:

* JWT Authentication
* Password Encryption
* Input Validation
* Rate Limiting

Scalability:

* Modular Architecture
* Docker Support
* Kubernetes Ready

Code Quality:

* SOLID Principles
* Clean Architecture
* Repository Pattern
* Unit Testing
* Integration Testing

---

# Deliverables

Generate:

1. Complete React Frontend
2. Complete FastAPI Backend
3. PostgreSQL Schema
4. Google Sheet Integration
5. JWT Authentication
6. ATS Score Checker
7. Cover Letter Generator
8. Job Search Engine
9. Dashboard Analytics
10. Reminder System
11. Email Notification Service
12. Docker Configuration
13. OpenAPI/Swagger Documentation
14. Unit Tests
15. Deployment Guide

The final application must be production-ready, responsive, scalable, secure, and visually modern, comparable to premium SaaS platforms such as LinkedIn Jobs, Indeed, and Lever.
