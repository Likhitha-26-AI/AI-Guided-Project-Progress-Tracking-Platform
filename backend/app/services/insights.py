"""
Parses the 6th agent's JSON output into a clean dict, tolerating the small
formatting quirks free LLMs sometimes add (markdown code fences, stray text
around the JSON) — returns None if it genuinely can't be parsed, so callers
can skip that project rather than crash.
"""
import json
import re


def parse_health_score(raw_text: str):
    if not raw_text:
        return None

    text = raw_text.strip()
    # Strip markdown code fences if the model wrapped its JSON in them.
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()

    # If there's extra prose around the JSON, grab the first {...} block.
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)

    try:
        data = json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return None

    required = ["feasibility", "scope_clarity", "tech_readiness", "timeline_realism", "risk_safety"]
    if not all(k in data for k in required):
        return None

    for k in required:
        try:
            data[k] = max(0, min(10, float(data[k])))
        except (TypeError, ValueError):
            return None

    top_risks = data.get("top_risks", [])
    cleaned_risks = []
    if isinstance(top_risks, list):
        for r in top_risks[:5]:
            if isinstance(r, dict) and "name" in r:
                cleaned_risks.append({
                    "name": str(r.get("name", ""))[:80],
                    "severity": max(1, min(3, int(r.get("severity", 2)))) if str(r.get("severity", 2)).isdigit() else 2,
                    "likelihood": max(1, min(3, int(r.get("likelihood", 2)))) if str(r.get("likelihood", 2)).isdigit() else 2,
                })
    data["top_risks"] = cleaned_risks

    data["readiness_score"] = round(sum(data[k] for k in required) / len(required) * 10, 1)

    return data