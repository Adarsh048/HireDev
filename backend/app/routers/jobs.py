import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Depends
from bson import ObjectId

from app.database import get_db, serialize_doc
from app.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/recommended")
async def get_recommended_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    db = get_db()

    # 1. Check if user has uploaded a resume (candidateprofile must exist)
    profile = db["candidateprofiles"].find_one({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]
    })
    if not profile or not profile.get("skills"):
        return {
            "success": True,
            "data": {"recommendations": []},
            "pagination": {
                "page": page,
                "limit": limit,
                "total": 0,
                "totalPages": 0,
            },
        }

    # 2. Find latest completed batch
    batch = db["recommendationbatches"].find_one(
        {"$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}], "status": "completed"},
        sort=[("generatedAt", -1)],
    )

    if not batch:
        return {
            "success": True,
            "data": {"recommendations": []},
            "pagination": {
                "page": page,
                "limit": limit,
                "total": 0,
                "totalPages": 0,
            },
        }

    query = {
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}],
        "batch": batch["_id"],
    }

    skip = (page - 1) * limit
    total = db["recommendations"].count_documents(query)
    recs_cursor = db["recommendations"].find(query).sort("matchScore", -1).skip(skip).limit(limit)

    recommendations = []
    for rec in recs_cursor:
        rec_clean = serialize_doc(rec)
        job_id = rec.get("job")
        if job_id:
            job_doc = db["jobpostings"].find_one({"_id": ObjectId(job_id) if ObjectId.is_valid(str(job_id)) else job_id})
            rec_clean["job"] = serialize_doc(job_doc) if job_doc else None
        recommendations.append(rec_clean)

    return {
        "success": True,
        "data": {"recommendations": recommendations},
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": max(1, (total + limit - 1) // limit),
        },
    }


@router.get("/platform/{platform}")
async def get_by_platform(
    platform: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    db = get_db()

    batch = db["recommendationbatches"].find_one(
        {"$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}], "status": "completed"},
        sort=[("generatedAt", -1)],
    )

    if not batch:
        return {
            "success": True,
            "data": {
                "recommendations": [],
                "platform": platform,
            },
        }

    # Case-insensitive platform match
    query = {
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}],
        "batch": batch["_id"],
        "platform": {"$regex": f"^{platform}$", "$options": "i"},
    }

    recs_cursor = db["recommendations"].find(query).sort([("rankInPlatform", 1), ("matchScore", -1)]).limit(10)
    recommendations = []
    for rec in recs_cursor:
        rec_clean = serialize_doc(rec)
        job_id = rec.get("job")
        if job_id:
            job_doc = db["jobpostings"].find_one({"_id": ObjectId(job_id) if ObjectId.is_valid(str(job_id)) else job_id})
            rec_clean["job"] = serialize_doc(job_doc) if job_doc else None
        recommendations.append(rec_clean)

    return {
        "success": True,
        "data": {
            "recommendations": recommendations,
            "platform": platform,
        },
    }


@router.get("/saved")
async def get_saved_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    db = get_db()

    query = {"$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]}
    skip = (page - 1) * limit
    total = db["savedjobs"].count_documents(query)

    saved_cursor = db["savedjobs"].find(query).sort("savedAt", -1).skip(skip).limit(limit)
    saved_jobs = []
    for s in saved_cursor:
        s_clean = serialize_doc(s)
        job_id = s.get("job")
        if job_id:
            job_doc = db["jobpostings"].find_one({"_id": ObjectId(job_id) if ObjectId.is_valid(str(job_id)) else job_id})
            s_clean["job"] = serialize_doc(job_doc) if job_doc else None
        saved_jobs.append(s_clean)

    return {
        "success": True,
        "data": {"savedJobs": saved_jobs},
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": max(1, (total + limit - 1) // limit),
        },
    }


@router.get("/{job_id}")
async def get_job_by_id(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    user_id = current_user["id"]

    try:
        oid = ObjectId(job_id)
        job_doc = db["jobpostings"].find_one({"_id": oid})
    except Exception:
        job_doc = db["jobpostings"].find_one({"_id": job_id})

    if not job_doc:
        raise HTTPException(status_code=404, detail="Job posting not found")

    # Check saved
    is_saved = db["savedjobs"].count_documents({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}],
        "job": job_doc["_id"]
    }) > 0

    # Check recommendation
    rec = db["recommendations"].find_one({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}],
        "job": job_doc["_id"]
    })

    return {
        "success": True,
        "data": {
            "job": serialize_doc(job_doc),
            "recommendation": serialize_doc(rec) if rec else None,
            "isSaved": is_saved,
        },
    }


@router.post("/{job_id}/save")
async def toggle_save_job(
    job_id: str,
    body: Optional[dict] = None,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    db = get_db()

    try:
        oid = ObjectId(job_id)
    except Exception:
        oid = job_id

    query = {
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}],
        "job": oid,
    }

    existing = db["savedjobs"].find_one(query)
    if existing:
        db["savedjobs"].delete_one({"_id": existing["_id"]})
        return {
            "success": True,
            "message": "Job removed from saved list",
            "data": {"saved": False},
        }
    else:
        notes = (body or {}).get("notes", "")
        db["savedjobs"].insert_one({
            "user": user_id,
            "job": oid,
            "notes": notes,
            "savedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        })
        return {
            "success": True,
            "message": "Job saved",
            "data": {"saved": True},
        }
