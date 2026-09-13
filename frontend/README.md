# Frontend — AI-Guided Project Progress Tracking Platform

React (Vite) + Tailwind CSS. Pastel, professional UI with a live-animated
AI agent pipeline, interactive mentor chatbot, and separate student/faculty
dashboards.

## 1. Setup

```bash
cd frontend
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Leave `VITE_API_BASE_URL` as `http://localhost:8000` unless your backend runs
somewhere else.

## 3. Run

```bash
npm run dev
```

Opens at `http://localhost:5173`. Make sure the backend (see `../backend`)
is running at the same time — the frontend calls it directly.

## What's here

- `/login`, `/signup` — auth, with role chosen once at signup (student/faculty),
  strictly separated from then on.
- `/student` — dashboard with personalized greeting, daily quote, and project list.
- `/student/new-project` — submit an idea (title, description, domain, team size,
  timeline) or import an existing GitHub repo.
- `/student/projects/:id` — the live agent pipeline (watch all 5 agents work
  in real time over WebSocket) plus the interactive AI mentor chat.
- `/faculty` — dashboard with live stats and every student's project status.
- `/faculty/projects/:id` — read-only view of a specific student's blueprint.

Nothing is hardcoded — every greeting, quote, stat, and piece of AI output
comes from the backend API.
