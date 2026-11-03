"""Tests for resume parsing."""
import pytest
from app.services.skill_extractor import extract_skills_from_text
from app.utils.text_processing import extract_email, extract_phone, normalize_skill


def test_extract_email():
    assert extract_email("Contact: john@example.com for details") == "john@example.com"
    assert extract_email("No email here") is None


def test_extract_phone():
    assert extract_phone("Call me at +91 9876543210") is not None
    assert extract_phone("Phone: 9876543210") is not None


def test_normalize_skill():
    assert normalize_skill("JS") == "javascript"
    assert normalize_skill("React.js") == "react"
    assert normalize_skill("Python") == "python"


def test_extract_skills():
    text = "I know Python, React, MongoDB, and Docker. Experience with AWS and Kubernetes."
    result = extract_skills_from_text(text)
    assert "python" in result["skills"]
    assert "react" in result["frameworks"]
    assert "mongodb" in result["databases"]
