from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload

from app import models, schemas, auth
from app.database import get_db
from app.services.agents import run_agent_pipeline
from app.services.quotes import get_daily_quote
from app.services.doc_generator import generate_report_docx, generate_slides_pptx
from app.services.insights import parse_health_score
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/student", tags=["student"])


@router.get("/greeting")
def greeting(current_user: models.User = Depends(auth.require_student)):
    hour = datetime.now().hour
    time_of_day = "morning" if hour < 12 else "afternoon" if hour < 18 else "evening"
    return {
        "greeting": f"Good {time_of_day}, {current_user.name.split(' ')[0]}",
        "quote": get_daily_quote("student"),
    }


@router.get("/projects", response_model=List[schemas.ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    projects = (
        db.query(models.Project)
        .options(joinedload(models.Project.agent_runs))
        .filter(models.Project.owner_id == current_user.id)
        .order_by(models.Project.created_at.desc())
        .all()
    )
    return projects


@router.post("/projects/manual", response_model=schemas.ProjectOut)
async def create_project_manual(
    payload: schemas.ProjectCreateManual,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = models.Project(
        owner_id=current_user.id,
        title=payload.title,
        source_type="manual",
        idea_text=payload.idea_text,
        domain=payload.domain,
        team_size=payload.team_size,
        expected_timeline_weeks=payload.expected_timeline_weeks,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    db.add(models.ProgressEvent(project_id=project.id, label="Project created from idea"))
    db.commit()

    background_tasks.add_task(_run_pipeline_bg, project.id)
    return project


@router.post("/projects/github", response_model=schemas.ProjectOut)
async def create_project_from_github(
    payload: schemas.ProjectCreateFromGitHub,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = models.Project(
        owner_id=current_user.id,
        title=payload.title or payload.repo_full_name,
        source_type="github",
        github_repo_full_name=payload.repo_full_name,
        github_repo_url=payload.repo_url,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    db.add(models.ProgressEvent(project_id=project.id, label="Project imported from GitHub"))
    db.commit()

    background_tasks.add_task(_run_pipeline_bg, project.id)
    return project


def _run_pipeline_bg(project_id: str):
    """Runs in a background task with its own DB session (can't reuse the
    request-scoped one after the response returns)."""
    import asyncio
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
        if project:
            asyncio.run(run_agent_pipeline(db, project))
    finally:
        db.close()


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = (
        db.query(models.Project)
        .options(joinedload(models.Project.agent_runs))
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@router.get("/projects/{project_id}/download/report")
def download_report(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = (
        db.query(models.Project)
        .options(joinedload(models.Project.agent_runs))
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    path = generate_report_docx(project)
    return FileResponse(path, filename=f"{project.title}_report.docx")


@router.get("/projects/{project_id}/download/slides")
def download_slides(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    project = (
        db.query(models.Project)
        .options(joinedload(models.Project.agent_runs))
        .filter(models.Project.id == project_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    path = generate_slides_pptx(project)
    return FileResponse(path, filename=f"{project.title}_slides.pptx")


@router.get("/insights", response_model=List[schemas.ProjectInsightOut])
def student_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    """Health scores for every project this student has that's completed the
    pipeline — powers the radar chart, readiness score, and risk heatmap."""
    projects = (
        db.query(models.Project)
        .options(joinedload(models.Project.agent_runs))
        .filter(models.Project.owner_id == current_user.id)
        .all()
    )

    results = []
    for project in projects:
        score_run = next((r for r in project.agent_runs if r.agent_key == "health_score"), None)
        parsed = parse_health_score(score_run.output_text) if score_run else None
        results.append(schemas.ProjectInsightOut(
            project_id=project.id,
            project_title=project.title,
            scores=schemas.HealthScoreOut(**parsed) if parsed else None,
        ))
    return results


@router.get("/activity")
def recent_activity(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    """Recent real events across all of this student's projects — every
    agent completion and faculty comment is already logged as a
    ProgressEvent, so this just surfaces what's genuinely happened."""
    events = (
        db.query(models.ProgressEvent)
        .join(models.Project)
        .filter(models.Project.owner_id == current_user.id)
        .order_by(models.ProgressEvent.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": e.id,
            "label": e.label,
            "detail": e.detail,
            "created_at": e.created_at,
            "project_title": e.project.title if e.project else None,
        }
        for e in events
    ]


@router.get("/tasks", response_model=List[schemas.ProjectTasksOut])
async def get_all_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    """Aggregates the timeline checklist across every one of the student's
    projects — this is what powers the sidebar Tasks page. Also computes
    each project's on-track/ahead/behind status and, when it's meaningfully
    off-schedule, a warm AI-generated note about it.
    """
    from app.services.tasks import compute_task_status
    from app.services.hf_client import generate

    projects = (
        db.query(models.Project)
        .options(joinedload(models.Project.timeline_tasks))
        .filter(models.Project.owner_id == current_user.id)
        .all()
    )

    results = []
    for project in projects:
        tasks = project.timeline_tasks
        if not tasks:
            continue

        weeks_map = {}
        for t in sorted(tasks, key=lambda x: x.order_index):
            weeks_map.setdefault(t.week_number, {"week_number": t.week_number, "goal": t.week_goal, "tasks": []})
            weeks_map[t.week_number]["tasks"].append(t)

        weeks_out = [
            schemas.WeekTasksOut(
                week_number=w["week_number"],
                goal=w["goal"],
                tasks=[schemas.TaskItemOut.model_validate(t) for t in w["tasks"]],
            )
            for w in sorted(weeks_map.values(), key=lambda x: x["week_number"])
        ]

        status = compute_task_status(project, tasks)
        ai_message = None

        if status and status["status"] in ("behind", "ahead"):
            pending_tasks = [t.task_text for t in tasks if not t.is_done][:3]
            if status["status"] == "behind":
                prompt = (
                    "You are a warm, encouraging academic project mentor AI. The student is "
                    f"behind schedule on their project '{project.title}' — they should be on "
                    f"week {status['expected_week']} but have only completed through week "
                    f"{status['actual_week']}. Some pending tasks: {', '.join(pending_tasks) or 'various tasks'}. "
                    "Write one short, warm, non-judgmental message noting they're a bit behind "
                    "and asking if they need help with something specific. 2-3 sentences."
                )
            else:
                prompt = (
                    "You are a warm, encouraging academic project mentor AI. The student is "
                    f"AHEAD of schedule on their project '{project.title}' — they're already "
                    f"through week {status['actual_week']} when they'd only need to be on week "
                    f"{status['expected_week']}. Write one short, congratulatory message noting "
                    "they're ahead of plan. 1-2 sentences."
                )
            try:
                ai_message = await generate(prompt, max_new_tokens=100)
            except RuntimeError:
                ai_message = None

        results.append(schemas.ProjectTasksOut(
            project_id=project.id,
            project_title=project.title,
            expected_timeline_weeks=project.expected_timeline_weeks,
            weeks=weeks_out,
            task_status=schemas.TaskStatusOut(**status) if status else None,
            ai_message=ai_message,
        ))

    return results


@router.patch("/tasks/{task_id}")
def toggle_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_student),
):
    task = (
        db.query(models.TimelineTask)
        .join(models.Project)
        .filter(models.TimelineTask.id == task_id, models.Project.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    task.is_done = not task.is_done
    task.completed_at = datetime.utcnow() if task.is_done else None
    db.commit()

    return {"id": task.id, "is_done": task.is_done}