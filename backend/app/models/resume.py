from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class Education(BaseModel):
    degree: str
    institution: str
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None


class Project(BaseModel):
    title: str
    description: str
    technologies: list[str] = []
    link: Optional[str] = None


class Experience(BaseModel):
    company: str
    role: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: str = ""
    is_current: bool = False


class Internship(BaseModel):
    company: str
    role: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: str = ""


class ExtractedResume(BaseModel):
    full_name: str = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    education: list[Education] = []
    skills: list[str] = []
    programming_languages: list[str] = []
    frameworks: list[str] = []
    databases: list[str] = []
    projects: list[Project] = []
    experience: list[Experience] = []
    internships: list[Internship] = []
    certifications: list[str] = []
    raw_text: str = ""  # The raw extracted text for reference


class ResumeParseResponse(BaseModel):
    success: bool
    data: Optional[ExtractedResume] = None
    error: Optional[str] = None
