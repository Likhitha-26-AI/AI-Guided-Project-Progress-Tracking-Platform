"""
The 5 specialized agents from the project blueprint:
Idea Evaluation -> Scope Definition -> Tech Recommendation -> Timeline Planning -> Risk Assessment.

Each agent is a focused, well-engineered prompt against the same free HF model
(see hf_client.py). They run in sequence because each one's output feeds the
next one's context — this also lets us broadcast per-agent status live over
the WebSocket, so the frontend can render the pipeline as it happens instead
of waiting for one big blob at the end.
"""
from datetime import datetime
from sqlalchemy.orm import Session

from app import models
from app.services.hf_client import generate
from app.services.tasks import parse_task_breakdown
from app.websocket_manager import manager

# Ordered agent definitions — order_index drives both DB storage and UI order.
AGENT_DEFINITIONS = [
    {
        "key": "idea_evaluation",
        "label": "Idea Evaluation",
        "order": 0,
        "prompt_template": (
            "You are an academic project mentor AI. Evaluate the following student "
            "project idea for feasibility, innovation level, and estimated difficulty "
            "and duration for a student developer. Be specific and encouraging but honest.\n\n"
            "Project idea:\n{idea}\n\n"
            "Respond in 4 short sections: Feasibility, Innovation Level, "
            "Estimated Difficulty, Estimated Duration."
        ),
    },
    {
        "key": "scope",
        "label": "Scope Definition",
        "order": 1,
        "prompt_template": (
            "You are an academic project mentor AI. Based on this project idea and its "
            "feasibility evaluation, define a clear project scope.\n\n"
            "Project idea:\n{idea}\n\n"
            "Feasibility evaluation:\n{idea_evaluation}\n\n"
            "Respond with: Project Objectives, Core Features & Deliverables, "
            "and Functional Requirements — as short bullet points."
        ),
    },
    {
        "key": "tech",
        "label": "Tech Recommendation",
        "order": 2,
        "prompt_template": (
            "You are an academic project mentor AI. Recommend a technology stack for "
            "this project, using only free/open-source tools where possible so a student "
            "can build it with zero budget.\n\n"
            "Project idea:\n{idea}\n\n"
            "Scope:\n{scope}\n\n"
            "Respond with: Frontend, Backend, AI/ML tools (if relevant), and Database — "
            "each with a one-line reason."
        ),
    },
    {
        "key": "timeline",
        "label": "Timeline Planning",
        "order": 3,
        "max_tokens": 1000,
        "prompt_template": (
            "You are an academic project mentor AI. Create a realistic weekly development "
            "timeline for this project, from kickoff to final submission.\n\n"
            "Project idea:\n{idea}\n\n"
            "Scope:\n{scope}\n\n"
            "Tech stack:\n{tech}\n\n"
            "The student has exactly {weeks} weeks for this project. You MUST create "
            "EXACTLY {weeks} weeks of plan — do not stop early and do not compress into "
            "fewer weeks. Respond as a week-by-week plan (Week 1 through Week {weeks}) "
            "with a short goal per week and 2-4 concrete tasks under each week, including "
            "testing and deployment phases toward the end."
        ),
    },
    {
        "key": "risk",
        "label": "Risk Assessment",
        "order": 4,
        "prompt_template": (
            "You are an academic project mentor AI. Identify realistic risks for this "
            "project and how to mitigate them.\n\n"
            "Project idea:\n{idea}\n\n"
            "Tech stack:\n{tech}\n\n"
            "Timeline:\n{timeline}\n\n"
            "Respond with: Data/API Cost Risks, Technical Challenges, and Mitigation "
            "Strategies — as short bullet points."
        ),
    },
]

# The 6th step: not shown as a pipeline stage to the student, but computed right
# after the 5 agents finish. Scores the blueprint 0-10 on five axes and flags
# top risks with severity/likelihood — powers the Insights radar chart,
# readiness score, and risk heatmap. Strict JSON so the frontend can parse it
# directly without any text wrangling.
HEALTH_SCORE_PROMPT = (
    "You are scoring an academic project blueprint. Based on everything below, "
    "score the project from 0-10 on each axis (10 = excellent, 0 = very weak), "
    "and list the 3 biggest risks with severity and likelihood on a 1-3 scale "
    "(3 = high).\n\n"
    "Idea evaluation:\n{idea_evaluation}\n\n"
    "Scope:\n{scope}\n\n"
    "Tech stack:\n{tech}\n\n"
    "Timeline:\n{timeline}\n\n"
    "Risk assessment:\n{risk}\n\n"
    "Respond with ONLY valid JSON, no other text, in exactly this shape:\n"
    '{{"feasibility": 0, "scope_clarity": 0, "tech_readiness": 0, '
    '"timeline_realism": 0, "risk_safety": 0, "top_risks": '
    '[{{"name": "short risk name", "severity": 1, "likelihood": 1}}]}}'
)

# 7th step: turns the Timeline agent's prose plan into a strict-JSON list of
# checkable tasks per week — this is what powers the sidebar Tasks checklist.
TASK_BREAKDOWN_PROMPT = (
    "Convert this week-by-week project timeline into a structured task list. "
    "There must be EXACTLY {weeks} weeks in your output, matching the plan below.\n\n"
    "Timeline:\n{timeline}\n\n"
    "Respond with ONLY valid JSON, no other text, in exactly this shape:\n"
    '{{"weeks": [{{"week": 1, "goal": "short goal for this week", '
    '"tasks": ["short task 1", "short task 2", "short task 3"]}}]}}'
)


async def run_agent_pipeline(db: Session, project: models.Project):
    """Runs all 5 agents in order for a project, persisting + broadcasting each
    status change live so the frontend can render the pipeline in real time.
    """
    idea_summary = project.idea_text or f"GitHub repo: {project.github_repo_full_name}"
    weeks = project.expected_timeline_weeks or 8
    project_facts = (
        f"Idea: {idea_summary}\n"
        f"Domain: {project.domain or 'Not specified'}\n"
        f"Team size: {project.team_size or 'Not specified'}\n"
        f"Student's expected timeline: {weeks} week(s)"
    )
    context = {"idea": project_facts, "weeks": weeks}

    for definition in AGENT_DEFINITIONS:
        agent_run = (
            db.query(models.AgentRun)
            .filter(
                models.AgentRun.project_id == project.id,
                models.AgentRun.agent_key == definition["key"],
            )
            .first()
        )
        if agent_run is None:
            agent_run = models.AgentRun(
                project_id=project.id,
                agent_key=definition["key"],
                agent_label=definition["label"],
                order_index=definition["order"],
                status=models.AgentStatusEnum.pending,
            )
            db.add(agent_run)
            db.commit()
            db.refresh(agent_run)

        # --- mark as working, broadcast ---
        agent_run.status = models.AgentStatusEnum.working
        agent_run.started_at = datetime.utcnow()
        db.commit()

        project.current_stage = definition["key"]
        db.commit()

        await manager.broadcast(project.id, {
            "type": "agent_status",
            "agent_key": definition["key"],
            "agent_label": definition["label"],
            "status": "working",
        })

        try:
            prompt = definition["prompt_template"].format(**context)
            output = await generate(prompt, max_new_tokens=definition.get("max_tokens", 400))
            context[definition["key"]] = output

            agent_run.status = models.AgentStatusEnum.completed
            agent_run.output_text = output
            agent_run.completed_at = datetime.utcnow()
            db.commit()

            db.add(models.ProgressEvent(
                project_id=project.id,
                label=f"{definition['label']} completed",
                detail=output[:200],
            ))
            db.commit()

            await manager.broadcast(project.id, {
                "type": "agent_status",
                "agent_key": definition["key"],
                "agent_label": definition["label"],
                "status": "completed",
                "output": output,
            })

        except Exception as exc:
            agent_run.status = models.AgentStatusEnum.failed
            agent_run.output_text = f"Error: {exc}"
            db.commit()

            await manager.broadcast(project.id, {
                "type": "agent_status",
                "agent_key": definition["key"],
                "agent_label": definition["label"],
                "status": "failed",
                "error": str(exc),
            })
            # Stop the pipeline — later agents depend on this one's output.
            return

    # 6th step: compute health scores now that all 5 agents have real output.
    # Stored as an AgentRun too (key "health_score") so it persists alongside
    # everything else — but it's intentionally left out of AGENT_DEFINITIONS,
    # so the visible student-facing pipeline still only ever shows 5 stages.
    try:
        score_prompt = HEALTH_SCORE_PROMPT.format(
            idea_evaluation=context.get("idea_evaluation", ""),
            scope=context.get("scope", ""),
            tech=context.get("tech", ""),
            timeline=context.get("timeline", ""),
            risk=context.get("risk", ""),
        )
        score_output = await generate(score_prompt, max_new_tokens=350, temperature=0.3)

        existing_score = (
            db.query(models.AgentRun)
            .filter(models.AgentRun.project_id == project.id, models.AgentRun.agent_key == "health_score")
            .first()
        )
        if existing_score is None:
            existing_score = models.AgentRun(
                project_id=project.id,
                agent_key="health_score",
                agent_label="Health Score",
                order_index=5,
            )
            db.add(existing_score)

        existing_score.status = models.AgentStatusEnum.completed
        existing_score.output_text = score_output
        existing_score.completed_at = datetime.utcnow()
        db.commit()
    except Exception:
        # Non-fatal — the student still gets their full 5-agent blueprint even
        # if the scoring step fails; Insights just won't have data for this project yet.
        pass

    # 7th step: break the timeline into checkable weekly tasks. Also non-fatal —
    # if this fails, the student still has their prose timeline, just no checklist.
    try:
        weeks = project.expected_timeline_weeks or 8
        task_prompt = TASK_BREAKDOWN_PROMPT.format(
            weeks=weeks,
            timeline=context.get("timeline", ""),
        )
        task_output = await generate(task_prompt, max_new_tokens=900, temperature=0.3)
        parsed_weeks = parse_task_breakdown(task_output, weeks)

        if parsed_weeks:
            # Clear out any previous task breakdown for this project before
            # inserting fresh ones (relevant if the pipeline is ever re-run).
            db.query(models.TimelineTask).filter(
                models.TimelineTask.project_id == project.id
            ).delete()

            order = 0
            for week_data in parsed_weeks:
                for task_text in week_data["tasks"]:
                    db.add(models.TimelineTask(
                        project_id=project.id,
                        week_number=week_data["week"],
                        week_goal=week_data["goal"],
                        task_text=task_text,
                        order_index=order,
                    ))
                    order += 1
            db.commit()
    except Exception:
        pass

    project.status = "blueprint_ready"
    project.last_activity_at = datetime.utcnow()
    db.commit()

    await manager.broadcast(project.id, {"type": "pipeline_complete"})