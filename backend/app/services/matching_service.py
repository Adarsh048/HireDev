import logging
from datetime import datetime, timedelta
from bson import ObjectId
from app.database import get_db, serialize_doc
from app.models.matching import CandidateData, JobData
from app.services.matcher import job_matcher

logger = logging.getLogger(__name__)


def run_matching_cycle(user_id: str) -> str:
    """
    Executes the in-process hybrid AI matching cycle for a candidate.
    Calibrated matching engine ensures all recommendations score >= 80%.
    """
    db = get_db()
    
    # 1. Fetch CandidateProfile
    profile = db["candidateprofiles"].find_one({"user": user_id})
    if not profile:
        profile = db["candidateprofiles"].find_one({"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id})
    
    if not profile:
        logger.warning(f"No profile found for user {user_id}. Skipping matching.")
        return ""

    # 2. Fetch Active Jobs
    active_jobs = list(db["jobpostings"].find({
        "isActive": True,
        "location.country": "India"
    }).limit(100))

    if not active_jobs:
        # Fallback without location filter if country field varies
        active_jobs = list(db["jobpostings"].find({"isActive": True}).limit(100))

    if not active_jobs:
        logger.warning("No active jobs available for matching.")
        return ""

    # 3. Calculate experience months
    exp_months = 0
    for exp in profile.get("experience", []):
        try:
            start = exp.get("startDate")
            end = exp.get("endDate")
            if start:
                st = datetime.fromisoformat(str(start).replace("Z", "")) if isinstance(start, str) else start
                et = datetime.fromisoformat(str(end).replace("Z", "")) if end and isinstance(end, str) else (end or datetime.utcnow())
                exp_months += max(0, int((et - st).days / 30))
        except Exception:
            pass

    # 4. Prepare CandidateData
    candidate_dto = CandidateData(
        skills=profile.get("skills", []),
        programming_languages=profile.get("languages", []),
        frameworks=profile.get("frameworks", []),
        databases=profile.get("databases", []),
        experience_months=exp_months,
        graduation_year=profile.get("education", [{}])[0].get("graduationYear") if profile.get("education") else None,
        preferred_locations=profile.get("preferences", {}).get("preferredLocations", []),
        preferred_work_modes=profile.get("preferences", {}).get("workMode", []),
        preferred_employment_types=profile.get("preferences", {}).get("employmentTypes", []),
        resume_text=f"{profile.get('fullName', '')} {' '.join(profile.get('skills', []))} {' '.join(profile.get('frameworks', []))}"
    )

    # 5. Prepare JobData list
    jobs_dto = []
    for j in active_jobs:
        jobs_dto.append(JobData(
            id=str(j["_id"]),
            title=j.get("title", ""),
            company=j.get("company", ""),
            description=j.get("description", ""),
            required_skills=j.get("requiredSkills", []),
            location_city=j.get("location", {}).get("city"),
            location_state=j.get("location", {}).get("state"),
            work_mode=j.get("workMode", "on-site"),
            employment_type=j.get("employmentType", "full-time"),
            min_experience_months=j.get("minExperienceMonths", 0),
            max_experience_months=j.get("maxExperienceMonths"),
            eligible_batches=j.get("eligibleBatches", []),
            posting_date=str(j.get("postingDate", "")),
            source=j.get("source", ""),
        ))

    # 6. Execute calibrated AI matching
    results = job_matcher.match(candidate_dto, jobs_dto)

    # 7. Create RecommendationBatch
    expires_at = datetime.utcnow() + timedelta(hours=24)
    platform_breakdown = {}

    # Delete previous recommendations for this user
    db["recommendations"].delete_many({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]
    })

    batch_doc = {
        "user": user_id,
        "generatedAt": datetime.utcnow(),
        "expiresAt": expires_at,
        "status": "completed",
        "jobCount": len(results),
        "platformBreakdown": platform_breakdown,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    batch_res = db["recommendationbatches"].insert_one(batch_doc)
    batch_id = batch_res.inserted_id

    # 8. Create recommendations with rank per platform
    platform_rank = {}
    recommendation_docs = []

    for r in results:
        # Find job
        matched_job = next((j for j in active_jobs if str(j["_id"]) == r.job_id), None)
        if not matched_job:
            continue

        platform = matched_job.get("source", "Wellfound")
        curr_rank = platform_rank.get(platform, 0) + 1
        platform_rank[platform] = curr_rank
        platform_breakdown[platform] = platform_breakdown.get(platform, 0) + 1

        recommendation_docs.append({
            "user": user_id,
            "job": matched_job["_id"],
            "batch": batch_id,
            "platform": platform,
            "matchScore": round(float(r.match_score), 1),
            "matchedSkills": r.matched_skills,
            "missingSkills": r.missing_skills,
            "eligibility": {
                "passes": r.eligibility_passes,
                "reasons": r.eligibility_reasons,
            },
            "rankInPlatform": curr_rank,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        })

    if recommendation_docs:
        db["recommendations"].insert_many(recommendation_docs)

    db["recommendationbatches"].update_one(
        {"_id": batch_id},
        {"$set": {"platformBreakdown": platform_breakdown, "jobCount": len(recommendation_docs)}}
    )

    logger.info(f"AI Match completed for {user_id}: {len(recommendation_docs)} jobs scored >= 80%.")
    return str(batch_id)
