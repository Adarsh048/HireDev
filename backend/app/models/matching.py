from pydantic import BaseModel, Field
from typing import Optional


class CandidateData(BaseModel):
    skills: list[str] = []
    programming_languages: list[str] = []
    frameworks: list[str] = []
    databases: list[str] = []
    experience_months: int = 0
    graduation_year: Optional[int] = None
    preferred_locations: list[str] = []
    preferred_work_modes: list[str] = []
    preferred_employment_types: list[str] = []
    resume_text: str = ""  # Full text for semantic matching


class JobData(BaseModel):
    id: str
    title: str
    company: str
    description: str = ""
    required_skills: list[str] = []
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    work_mode: str = "on-site"
    employment_type: str = "full-time"
    min_experience_months: int = 0
    max_experience_months: Optional[int] = None
    eligible_batches: list[int] = []
    posting_date: Optional[str] = None
    source: str = ""


class MatchResult(BaseModel):
    job_id: str
    match_score: float = Field(ge=0, le=100)
    semantic_score: float = 0
    skills_score: float = 0
    experience_score: float = 0
    title_score: float = 0
    location_score: float = 0
    freshness_score: float = 0
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    eligibility_passes: bool = True
    eligibility_reasons: list[str] = []
    recommendation_reasons: list[str] = []
    suggested_improvements: list[str] = []


class MatchRequest(BaseModel):
    candidate: CandidateData
    jobs: list[JobData]


class MatchResponse(BaseModel):
    success: bool
    results: list[MatchResult] = []
    error: Optional[str] = None
