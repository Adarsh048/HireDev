"""
AI Job Matching Engine.

Hybrid matching using:
- Sentence Transformers for semantic similarity
- Skill-based matching with taxonomy
- Rule-based eligibility verification
- Experience compatibility
- Graduation batch verification
- Location preferences
- Job freshness scoring

Configurable weights (from settings):
- Semantic similarity: 30%
- Skills compatibility: 30%
- Experience compatibility: 15%
- Job title relevance: 10%
- Location preference: 10%
- Freshness: 5%
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional

from app.config import settings
from app.models.matching import (
    CandidateData, JobData, MatchResult
)
from app.services.embeddings import embedding_service
from app.utils.text_processing import normalize_skill

logger = logging.getLogger(__name__)


class JobMatcher:
    """Matches candidate profiles against job postings."""

    def __init__(self):
        self.weights = {
            'semantic': settings.WEIGHT_SEMANTIC,
            'skills': settings.WEIGHT_SKILLS,
            'experience': settings.WEIGHT_EXPERIENCE,
            'title': settings.WEIGHT_TITLE,
            'location': settings.WEIGHT_LOCATION,
            'freshness': settings.WEIGHT_FRESHNESS,
        }

    def match(self, candidate: CandidateData, jobs: List[JobData]) -> List[MatchResult]:
        """
        Match a candidate against a list of jobs.

        Args:
            candidate: Structured candidate data.
            jobs: List of job postings to match against.

        Returns:
            List of MatchResult sorted by match_score descending.
        """
        if not jobs:
            return []

        results = []

        # Prepare candidate text for semantic matching
        candidate_text = self._build_candidate_text(candidate)

        # Compute semantic similarities in batch
        job_descriptions = [j.description or j.title for j in jobs]
        try:
            semantic_scores = embedding_service.compute_batch_similarity(
                candidate_text, job_descriptions
            )
        except Exception as e:
            logger.error(f"Semantic matching failed: {e}")
            semantic_scores = [0.0] * len(jobs)

        # Normalize candidate skills
        candidate_skills = set()
        for s in candidate.skills + candidate.programming_languages + candidate.frameworks + candidate.databases:
            candidate_skills.add(normalize_skill(s))

        for i, job in enumerate(jobs):
            result = self._score_job(
                candidate=candidate,
                candidate_skills=candidate_skills,
                candidate_text=candidate_text,
                job=job,
                semantic_score=semantic_scores[i],
            )
            results.append(result)

        # Sort by match score descending
        results.sort(key=lambda r: r.match_score, reverse=True)
        return results

    def _score_job(
        self,
        candidate: CandidateData,
        candidate_skills: set,
        candidate_text: str,
        job: JobData,
        semantic_score: float,
    ) -> MatchResult:
        """Score a single job against the candidate."""

        # 1. Skills matching
        job_skills = set(normalize_skill(s) for s in job.required_skills)
        matched = candidate_skills & job_skills
        missing = job_skills - candidate_skills

        if job_skills:
            skills_score = len(matched) / len(job_skills)
        else:
            skills_score = 0.5  # Neutral if no skills listed

        # 2. Experience compatibility
        experience_score = self._score_experience(candidate, job)

        # 3. Title relevance (semantic similarity between candidate skills/role and job title)
        title_score = semantic_score  # Simplified: use same semantic score
        try:
            title_score = embedding_service.compute_similarity(
                candidate_text[:200], job.title
            )
        except Exception:
            pass

        # 4. Location preference
        location_score = self._score_location(candidate, job)

        # 5. Freshness
        freshness_score = self._score_freshness(job)

        # Weighted total
        total = (
            self.weights['semantic'] * semantic_score +
            self.weights['skills'] * skills_score +
            self.weights['experience'] * experience_score +
            self.weights['title'] * title_score +
            self.weights['location'] * location_score +
            self.weights['freshness'] * freshness_score
        )

        # Normalize to 0-100
        match_score = round(min(100, max(0, total * 100)), 1)

        # Eligibility check (overrides score)
        eligibility_passes, eligibility_reasons = self._check_eligibility(candidate, job)

        # Generate recommendation reasons
        recommendation_reasons = self._generate_reasons(
            matched, missing, skills_score, semantic_score, experience_score
        )

        # Suggested improvements
        suggested_improvements = [
            f"Learn {skill}" for skill in list(missing)[:5]
        ]

        return MatchResult(
            job_id=job.id,
            match_score=match_score,
            semantic_score=round(semantic_score * 100, 1),
            skills_score=round(skills_score * 100, 1),
            experience_score=round(experience_score * 100, 1),
            title_score=round(title_score * 100, 1),
            location_score=round(location_score * 100, 1),
            freshness_score=round(freshness_score * 100, 1),
            matched_skills=sorted(list(matched)),
            missing_skills=sorted(list(missing)),
            eligibility_passes=eligibility_passes,
            eligibility_reasons=eligibility_reasons,
            recommendation_reasons=recommendation_reasons,
            suggested_improvements=suggested_improvements,
        )

    def _build_candidate_text(self, candidate: CandidateData) -> str:
        """Build a text representation of the candidate for semantic matching."""
        parts = []
        if candidate.skills:
            parts.append("Skills: " + ", ".join(candidate.skills))
        if candidate.programming_languages:
            parts.append("Languages: " + ", ".join(candidate.programming_languages))
        if candidate.frameworks:
            parts.append("Frameworks: " + ", ".join(candidate.frameworks))
        if candidate.resume_text:
            parts.append(candidate.resume_text[:1000])
        return " ".join(parts) if parts else "No profile data"

    def _score_experience(self, candidate: CandidateData, job: JobData) -> float:
        """Score experience compatibility."""
        cand_months = candidate.experience_months
        min_req = job.min_experience_months or 0
        max_req = job.max_experience_months

        if min_req == 0 and max_req is None:
            return 0.8  # No requirement — good for freshers

        if cand_months < min_req:
            # Under-qualified but may still be partially relevant
            if min_req > 0:
                return max(0, 1 - (min_req - cand_months) / min_req)
            return 0.5

        if max_req and cand_months > max_req:
            # Over-qualified
            return max(0.3, 1 - (cand_months - max_req) / max_req)

        return 1.0  # Within range

    def _score_location(self, candidate: CandidateData, job: JobData) -> float:
        """Score location preference match."""
        if job.work_mode == 'remote':
            if 'remote' in [m.lower() for m in candidate.preferred_work_modes]:
                return 1.0
            return 0.7  # Remote is generally acceptable

        if not candidate.preferred_locations:
            return 0.5  # No preference

        job_city = (job.location_city or "").lower()
        job_state = (job.location_state or "").lower()

        for loc in candidate.preferred_locations:
            loc_lower = loc.lower()
            if loc_lower in job_city or loc_lower in job_state:
                return 1.0

        return 0.2  # Location mismatch

    def _score_freshness(self, job: JobData) -> float:
        """Score job freshness — newer jobs score higher."""
        if not job.posting_date:
            return 0.5

        try:
            posting_date = datetime.fromisoformat(job.posting_date.replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            days_old = (now - posting_date).days

            if days_old <= 1:
                return 1.0
            elif days_old <= 7:
                return 0.8
            elif days_old <= 14:
                return 0.6
            elif days_old <= 30:
                return 0.4
            else:
                return 0.2
        except (ValueError, TypeError):
            return 0.5

    def _check_eligibility(self, candidate: CandidateData, job: JobData) -> tuple[bool, list[str]]:
        """
        Check mandatory eligibility requirements.
        Failures here OVERRIDE high skill-match scores.
        """
        reasons = []
        passes = True

        # Check experience minimum
        if job.min_experience_months and job.min_experience_months > 0:
            if candidate.experience_months < job.min_experience_months:
                deficit = job.min_experience_months - candidate.experience_months
                if deficit > 12:  # More than 1 year short — hard fail
                    passes = False
                    reasons.append(
                        f"Requires {job.min_experience_months // 12}+ years experience; "
                        f"you have {candidate.experience_months // 12} years"
                    )

        # Check graduation batch
        if job.eligible_batches and candidate.graduation_year:
            if candidate.graduation_year not in job.eligible_batches:
                passes = False
                reasons.append(
                    f"Eligible batches: {job.eligible_batches}; "
                    f"your graduation year: {candidate.graduation_year}"
                )

        if passes:
            reasons.append("Meets all mandatory eligibility requirements")

        return passes, reasons

    def _generate_reasons(
        self,
        matched: set,
        missing: set,
        skills_score: float,
        semantic_score: float,
        experience_score: float,
    ) -> list[str]:
        """Generate human-readable recommendation reasons."""
        reasons = []

        if skills_score >= 0.8:
            reasons.append(f"Strong skill match ({len(matched)} skills aligned)")
        elif skills_score >= 0.5:
            reasons.append(f"Moderate skill match ({len(matched)} skills aligned)")

        if semantic_score >= 0.7:
            reasons.append("High semantic relevance to your profile")

        if experience_score >= 0.8:
            reasons.append("Experience level well-suited")

        if missing:
            reasons.append(f"Consider developing: {', '.join(list(missing)[:3])}")

        return reasons


# Module-level singleton
job_matcher = JobMatcher()
