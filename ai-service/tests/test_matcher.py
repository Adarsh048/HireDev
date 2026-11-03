"""Tests for job matching engine."""
import pytest
from app.models.matching import CandidateData, JobData
from app.services.matcher import JobMatcher


@pytest.fixture
def matcher():
    return JobMatcher()


@pytest.fixture
def sample_candidate():
    return CandidateData(
        skills=["python", "react", "mongodb", "docker"],
        programming_languages=["python", "javascript"],
        frameworks=["react", "express"],
        databases=["mongodb"],
        experience_months=6,
        graduation_year=2024,
        preferred_locations=["Bangalore", "Hyderabad"],
        preferred_work_modes=["remote", "hybrid"],
        resume_text="Python developer with React and MongoDB experience",
    )


@pytest.fixture
def sample_jobs():
    return [
        JobData(
            id="job1",
            title="Python Developer",
            company="TechCorp",
            description="Looking for Python developer with React and MongoDB experience",
            required_skills=["python", "react", "mongodb"],
            location_city="Bangalore",
            work_mode="hybrid",
            min_experience_months=0,
            eligible_batches=[2024, 2025],
        ),
        JobData(
            id="job2",
            title="Senior Java Architect",
            company="BigBank",
            description="10+ years Java enterprise architect needed",
            required_skills=["java", "spring boot", "oracle", "kubernetes"],
            location_city="Mumbai",
            work_mode="on-site",
            min_experience_months=120,
            eligible_batches=[2014, 2015],
        ),
        JobData(
            id="job3",
            title="Frontend Developer",
            company="StartupXYZ",
            description="React developer for modern web applications",
            required_skills=["react", "javascript", "css"],
            location_city="Hyderabad",
            work_mode="remote",
            min_experience_months=0,
            eligible_batches=[2023, 2024, 2025],
        ),
    ]


def test_matcher_returns_results(matcher, sample_candidate, sample_jobs):
    """Matcher should return a result for each job."""
    results = matcher.match(sample_candidate, sample_jobs)
    assert len(results) == len(sample_jobs)


def test_matcher_best_match_first(matcher, sample_candidate, sample_jobs):
    """The best matching job should be ranked first."""
    results = matcher.match(sample_candidate, sample_jobs)
    # job1 should be the best match (Python + React + MongoDB + Bangalore)
    assert results[0].job_id == "job1"


def test_eligibility_check(matcher, sample_candidate, sample_jobs):
    """Senior role should fail eligibility for a fresher."""
    results = matcher.match(sample_candidate, sample_jobs)
    # Find job2 result
    job2_result = next(r for r in results if r.job_id == "job2")
    assert job2_result.eligibility_passes is False


def test_empty_jobs(matcher, sample_candidate):
    """Matcher should handle empty job list."""
    results = matcher.match(sample_candidate, [])
    assert results == []


def test_matched_skills(matcher, sample_candidate, sample_jobs):
    """Should correctly identify matched skills."""
    results = matcher.match(sample_candidate, sample_jobs)
    job1_result = next(r for r in results if r.job_id == "job1")
    assert "python" in job1_result.matched_skills
    assert "react" in job1_result.matched_skills
    assert "mongodb" in job1_result.matched_skills


def test_missing_skills(matcher, sample_candidate, sample_jobs):
    """Should correctly identify missing skills."""
    results = matcher.match(sample_candidate, sample_jobs)
    job2_result = next(r for r in results if r.job_id == "job2")
    assert "java" in job2_result.missing_skills
