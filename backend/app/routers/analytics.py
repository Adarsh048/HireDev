import logging
from collections import Counter
from fastapi import APIRouter, Depends
from bson import ObjectId

from app.database import get_db, serialize_doc
from app.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/skills")
async def get_skills_analytics(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = get_db()

    profile = db["candidateprofiles"].find_one({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]
    })

    user_skills = set(s.lower() for s in (profile.get("skills", []) if profile else []))

    # Analyze active jobs
    jobs = list(db["jobpostings"].find({"isActive": True}, {"requiredSkills": 1}))
    all_required_skills = []
    for j in jobs:
        all_required_skills.extend([s.strip() for s in j.get("requiredSkills", [])])

    counts = Counter(all_required_skills)
    top_in_demand = [
        {"skill": skill, "count": count, "isMatched": skill.lower() in user_skills}
        for skill, count in counts.most_common(12)
    ]

    missing = [item["skill"] for item in top_in_demand if not item["isMatched"]][:5]
    matched = [item["skill"] for item in top_in_demand if item["isMatched"]]

    return {
        "success": True,
        "data": {
            "topInDemandSkills": top_in_demand,
            "matchedSkills": matched,
            "recommendedSkillsToLearn": missing,
            "totalJobsAnalyzed": len(jobs),
        },
    }


@router.get("/applications")
async def get_applications_analytics(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = get_db()

    query = {"$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]}
    apps = list(db["applications"].find(query))

    status_counts = {"saved": 0, "applied": 0, "interview": 0, "rejected": 0, "offered": 0}
    for a in apps:
        st = a.get("status", "applied")
        if st in status_counts:
            status_counts[st] += 1
        else:
            status_counts[st] = 1

    total = len(apps)
    interview_count = status_counts.get("interview", 0) + status_counts.get("offered", 0)
    interview_rate = round((interview_count / total * 100), 1) if total > 0 else 0.0

    return {
        "success": True,
        "data": {
            "totalApplications": total,
            "byStatus": status_counts,
            "interviewRate": interview_rate,
        },
    }
