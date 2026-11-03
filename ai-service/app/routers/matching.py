"""Job matching API router."""
from fastapi import APIRouter, HTTPException
import logging

from app.models.matching import MatchRequest, MatchResponse
from app.services.matcher import job_matcher

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matching", tags=["Matching"])


@router.post("/match", response_model=MatchResponse)
async def match_jobs(request: MatchRequest):
    """
    Match a candidate profile against a list of job postings.

    Returns ranked match results with scores, matched/missing skills,
    eligibility status, and recommendation reasons.
    """
    if not request.jobs:
        return MatchResponse(success=True, results=[])

    try:
        results = job_matcher.match(
            candidate=request.candidate,
            jobs=request.jobs,
        )
        return MatchResponse(success=True, results=results)
    except Exception as e:
        logger.error(f"Matching failed: {e}", exc_info=True)
        return MatchResponse(
            success=False,
            error="Matching engine encountered an error. Please try again."
        )


@router.get("/health")
async def health_check():
    """Check if the matching service is operational."""
    return {"status": "ok", "service": "matching"}
