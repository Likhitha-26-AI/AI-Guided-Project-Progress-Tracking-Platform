from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models, schemas, auth
from app.database import get_db
from app.services.quotes import get_daily_quote
from app.services.insights import parse_health_score

router = APIRouter(prefix="/api/faculty", tags=["faculty"])


@router.get("/greeting")
def greeting(current_user: models.User = Depends(auth.require_faculty)):
    hour = datetime.now().hour
    time_of_day = "morning" if hour < 12 else "afternoon" if hour < 18 else "evening"
    return {
        "greeting": f"Good {time_of_day}, {current_user.name.split(' ')[0]}",
        "quote": get_daily_quote("faculty"),
    }


@router.get("/overview", response_model=schemas.FacultyOverviewOut)
def overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_faculty),
):
    from app.services.tasks import compute_task_status

    projects = (
        db.query(models.Project)
        .options(joinedload(models.Project.owner), joinedload(models.Project.timeline_tasks))
        .order_by(models.Project.last_activity_at.desc())
        .all()
    )

    stall_cutoff = datetime.utcnow() - timedelta(days=5)

    summaries = []
    behind_count = 0
    for p in projects:
        task_status = compute_task_status(p, p.timeline_tasks) if p.timeline_tasks else None
        weeks_behind = task_status["weeks_diff"] if task_status else None
        schedule_status = task_status["status"] if task_status else None

        # A project needs attention if it's genuinely behind on tasks, OR
        # (when no checklist exists yet) it's just gone quiet — inactivity
        # is the fallback signal, not the primary one anymore.
        is_flagged = (
            (task_status and task_status["status"] == "behind")
            or (not task_status and p.last_activity_at < stall_cutoff)
        )
        if is_flagged:
            behind_count += 1

        summaries.append(schemas.ProjectSummaryOut(
            id=p.id,
            title=p.title,
            status=p.status,
            current_stage=p.current_stage,
            last_activity_at=p.last_activity_at,
            owner_name=p.owner.name if p.owner else None,
            owner_email=p.owner.email if p.owner else None,
            weeks_behind=weeks_behind,
            schedule_status=schedule_status,
        ))

    total_students = db.query(models.User).filter(models.User.role == "student").count()
    active = [p for p in projects if p.status != "completed"]

    return schemas.FacultyOverviewOut(
        total_students=total_students,
        total_projects=len(projects),
        active_projects=len(active),
        stalled_projects=behind_count,
        students=summaries,
    )


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def view_student_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_faculty),
):
    project = (
        db.query(models.Project)
        .options(joinedload(models.Project.agent_runs))
        .filter(models.Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@router.get("/insights")
def faculty_cohort_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_faculty),
):
    """Averages every scored student project into one cohort-wide radar —
    e.g. spotting that students are consistently weak on Timeline Realism."""
    projects = db.query(models.Project).options(joinedload(models.Project.agent_runs)).all()

    axis_keys = ["feasibility", "scope_clarity", "tech_readiness", "timeline_realism", "risk_safety"]
    totals = {k: 0.0 for k in axis_keys}
    scored_count = 0
    per_project = []

    for project in projects:
        score_run = next((r for r in project.agent_runs if r.agent_key == "health_score"), None)
        parsed = parse_health_score(score_run.output_text) if score_run else None
        if parsed:
            scored_count += 1
            for k in axis_keys:
                totals[k] += parsed[k]
            per_project.append({
                "project_id": project.id,
                "project_title": project.title,
                "readiness_score": parsed["readiness_score"],
            })

    averages = {k: round(totals[k] / scored_count, 1) if scored_count else 0 for k in axis_keys}
    overall_readiness = round(sum(averages.values()) / len(axis_keys) * 10, 1) if scored_count else 0

    return {
        "scored_project_count": scored_count,
        "cohort_averages": averages,
        "cohort_readiness_score": overall_readiness,
        "projects": sorted(per_project, key=lambda p: p["readiness_score"]),
    }