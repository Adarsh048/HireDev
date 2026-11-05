import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from app.database import get_db, serialize_doc
from app.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("")
async def get_applications(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = get_db()

    query = {"$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]}
    apps_cursor = db["applications"].find(query).sort("createdAt", -1)

    applications = []
    for app_doc in apps_cursor:
        app_clean = serialize_doc(app_doc)
        job_id = app_doc.get("job")
        if job_id:
            job_doc = db["jobpostings"].find_one({"_id": ObjectId(job_id) if ObjectId.is_valid(str(job_id)) else job_id})
            app_clean["job"] = serialize_doc(job_doc) if job_doc else None
        applications.append(app_clean)

    return {
        "success": True,
        "data": {"applications": applications},
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_application(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    job_id = body.get("jobId") or body.get("job")
    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID is required")

    db = get_db()
    oid = ObjectId(job_id) if ObjectId.is_valid(str(job_id)) else job_id

    existing = db["applications"].find_one({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}],
        "job": oid,
    })

    if existing:
        raise HTTPException(status_code=409, detail="Application already tracked for this job")

    app_doc = {
        "user": user_id,
        "job": oid,
        "status": body.get("status", "applied"),
        "appliedAt": datetime.utcnow(),
        "notes": body.get("notes", ""),
        "statusHistory": [
            {
                "status": body.get("status", "applied"),
                "changedAt": datetime.utcnow(),
                "notes": body.get("notes", "Initial status"),
            }
        ],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }

    res = db["applications"].insert_one(app_doc)
    app_doc["_id"] = res.inserted_id

    # Populate job for response
    job_doc = db["jobpostings"].find_one({"_id": oid})
    app_clean = serialize_doc(app_doc)
    app_clean["job"] = serialize_doc(job_doc) if job_doc else None

    return {
        "success": True,
        "message": "Application tracked successfully",
        "data": {"application": app_clean},
    }


@router.patch("/{app_id}")
async def update_application(
    app_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    db = get_db()
    oid = ObjectId(app_id) if ObjectId.is_valid(app_id) else app_id

    app_doc = db["applications"].find_one({
        "_id": oid,
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}],
    })

    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")

    new_status = body.get("status")
    notes = body.get("notes")

    updates: dict = {"updatedAt": datetime.utcnow()}
    if notes is not None:
        updates["notes"] = notes

    if new_status and new_status != app_doc.get("status"):
        updates["status"] = new_status
        history_entry = {
            "status": new_status,
            "changedAt": datetime.utcnow(),
            "notes": notes or f"Status changed to {new_status}",
        }
        db["applications"].update_one(
            {"_id": oid},
            {"$set": updates, "$push": {"statusHistory": history_entry}},
        )
    else:
        db["applications"].update_one({"_id": oid}, {"$set": updates})

    updated_app = db["applications"].find_one({"_id": oid})
    app_clean = serialize_doc(updated_app)
    job_doc = db["jobpostings"].find_one({"_id": updated_app.get("job")})
    app_clean["job"] = serialize_doc(job_doc) if job_doc else None

    return {
        "success": True,
        "message": "Application updated successfully",
        "data": {"application": app_clean},
    }
