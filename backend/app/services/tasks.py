"""
Parses the task-breakdown AI step's JSON output into checkable tasks, and
computes whether a project is ahead of, on track with, or behind its
own timeline — purely from real dates and real checkbox state, no AI needed
for the faculty-facing version of this signal.
"""
import json
import re
from datetime import datetime, timedelta


def parse_task_breakdown(raw_text: str, expected_weeks: int):
    if not raw_text:
        return None

    text = raw_text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)

    try:
        data = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return None

    weeks = data.get("weeks")
    if not isinstance(weeks, list) or not weeks:
        return None

    cleaned = []
    for w in weeks:
        if not isinstance(w, dict):
            continue
        try:
            week_number = int(w.get("week"))
        except (TypeError, ValueError):
            continue
        tasks = w.get("tasks", [])
        if not isinstance(tasks, list):
            continue
        cleaned.append({
            "week": week_number,
            "goal": str(w.get("goal", ""))[:200],
            "tasks": [str(t)[:200] for t in tasks if t][:6],
        })

    return cleaned if cleaned else None


def compute_task_status(project, tasks: list):
    """Returns the project's schedule status computed from real elapsed time
    vs real checked-off tasks — no AI call needed, so this is cheap enough
    to run for every project on every dashboard load.
    """
    if not tasks or not project.expected_timeline_weeks:
        return None

    days_elapsed = (datetime.utcnow() - project.created_at).days
    expected_week = min(
        project.expected_timeline_weeks,
        max(1, (days_elapsed // 7) + 1),
    )

    weeks_present = sorted(set(t.week_number for t in tasks))
    actual_week = 0
    for wk in weeks_present:
        week_tasks = [t for t in tasks if t.week_number == wk]
        if all(t.is_done for t in week_tasks):
            actual_week = wk
        else:
            break

    diff = expected_week - actual_week  # positive = behind, negative = ahead

    all_done = all(t.is_done for t in tasks)
    if all_done:
        status = "completed"
    elif diff >= 1:
        status = "behind"
    elif diff <= -1:
        status = "ahead"
    else:
        status = "on_track"

    return {
        "expected_week": expected_week,
        "actual_week": actual_week,
        "weeks_diff": diff,
        "status": status,
        "all_done": all_done,
    }