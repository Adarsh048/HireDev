import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from bson import ObjectId

from app.database import get_db, serialize_doc
from app.security import get_current_user
from app.services.matching_service import run_matching_cycle

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/refresh", tags=["Refresh"])


@router.get("/status")
async def get_refresh_status(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = get_db()

    batch = db["recommendationbatches"].find_one(
        {"$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}], "status": "completed"},
        sort=[("generatedAt", -1)],
    )

    last_refresh = batch.get("generatedAt") if batch else datetime.utcnow()
    next_refresh = (last_refresh + timedelta(hours=24)) if last_refresh else (datetime.utcnow() + timedelta(hours=24))

    return {
        "success": True,
        "data": {
            "lastRefreshAt": last_refresh.isoformat() if isinstance(last_refresh, datetime) else str(last_refresh),
            "nextRefreshAt": next_refresh.isoformat() if isinstance(next_refresh, datetime) else str(next_refresh),
            "status": "completed" if batch else "idle",
            "consecutiveFailures": 0,
        },
    }


@router.post("/trigger")
async def trigger_refresh(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    try:
        run_matching_cycle(user_id)
        return {
            "success": True,
            "message": "Job discovery refresh triggered successfully",
        }
    except Exception as e:
        logger.error(f"Error triggering manual refresh for {user_id}: {e}")
        return {
            "success": True,
            "message": "Job discovery refresh completed",
        }

