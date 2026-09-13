@'
<div align="center">

# AI-Guided Project Progress Tracking Platform
### Planning & Mentorship Assistance, Powered by AI

![Powered by](https://img.shields.io/badge/Powered%20by-FastAPI%20%2B%20React-7B83C4?style=for-the-badge)
![Model](https://img.shields.io/badge/AI-Hugging%20Face-FFD21E?style=for-the-badge)
![Cost](https://img.shields.io/badge/Cost-100%25%20Free-7FBF9E?style=for-the-badge)
![Auth](https://img.shields.io/badge/Auth-GitHub%20OAuth-24292E?style=for-the-badge&logo=github)

**A team of 5 AI mentor agents turns a 2-3 line project idea into a full,**
**presentable project blueprint — live, in front of you, in seconds.**

</div>

---

## What it does

Type an idea. Watch 5 specialized AI agents work through it one by one — live,
on screen — until you have a complete plan: feasibility check, scope, tech
stack, week-by-week timeline, and risk assessment. Then keep building with an
AI mentor chat, a task checklist that tracks whether you're on schedule, and
an AI-generated readiness score. Your faculty mentor sees your progress in
real time and can leave feedback on any specific part of your blueprint.

Every AI feature runs on Hugging Face's **free** inference tier. No paid APIs,
no credit card, anywhere in this project.

## The 5 AI Agents

| # | Agent | What it does |
|---|-------|---------------|
| 1 | **Idea Evaluation** | Feasibility, innovation level, estimated difficulty |
| 2 | **Scope Definition** | Objectives, core features, functional requirements |
| 3 | **Tech Recommendation** | A free/open-source stack, matched to the project |
| 4 | **Timeline Planning** | A realistic, week-by-week build plan |
| 5 | **Risk Assessment** | Real risks, with mitigation strategies |

*(Two more agents work quietly behind the scenes: one scores the blueprint for
the Insights radar chart, and one turns the timeline into a checkable task
list.)*

## Features

- **Live agent pipeline** — watch each agent go from pending → working →
  completed, in real time over WebSocket
- **Interactive AI mentor chat** — per project, with proactive check-ins if
  you go quiet for a few days
- **Smart task checklist** — generated from your own timeline; tracks
  whether you're ahead, on track, or behind schedule
- **Insights dashboard** — AI-generated readiness score, radar chart, and
  risk heatmap
- **Faculty feedback** — comments on any specific part of your blueprint,
  not just a generic note
- **GitHub import** — already have a repo? Import it instead of typing an
  idea from scratch
- **One-click documents** — a polished Word report and PowerPoint deck,
  generated from your actual blueprint
- **Role-based access** — student and faculty views, enforced at the API
  level, not just hidden in the UI

## Tech Stack

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-live-4A90D9?style=flat-square)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Inference%20API-FFD21E?style=flat-square&logo=huggingface&logoColor=black)

**Backend:** FastAPI · SQLAlchemy · SQLite · WebSockets · JWT auth
**Frontend:** React (Vite) · Tailwind CSS · Framer Motion
**AI:** Hugging Face free inference API (`router.huggingface.co`)
**Auth:** GitHub OAuth (optional, powers the repo-import feature)

## Project Structure
project-tracking-platform/
├── backend/ — FastAPI application
└── frontend/ — React application

Each folder has its own README with detailed setup instructions.

## Getting Started

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
cp .env.example .env         # add your free HUGGINGFACE_API_KEY + a JWT_SECRET_KEY

python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env

npm run dev
```

Open **http://localhost:5173** and you're in.

See `backend/README.md` and `frontend/README.md` for the full setup —
including how to grab a free Hugging Face token and configure GitHub OAuth.

---

<div align="center">

Built as an academic project submission — every AI feature runs free, forever.

</div>
