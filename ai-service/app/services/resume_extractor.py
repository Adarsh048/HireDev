"""
Main resume extraction orchestrator.
Combines text extraction, NLP processing, and structured data extraction.
"""
import re
import logging
from typing import Optional

from app.models.resume import (
    ExtractedResume, Education, Project, Experience, Internship
)
from app.services.skill_extractor import extract_skills_from_text
from app.utils.text_processing import (
    clean_text, extract_email, extract_phone, split_into_sections
)

logger = logging.getLogger(__name__)


class ResumeExtractor:
    """Extracts structured information from raw resume text."""

    def __init__(self):
        self._nlp = None

    def _get_nlp(self):
        """Lazy-load spaCy model with graceful fallback."""
        if self._nlp is None:
            try:
                import spacy
                self._nlp = spacy.load("en_core_web_sm")
            except (OSError, ImportError, Exception) as e:
                logger.info(f"Using high-performance heuristic NER (spaCy optional: {e})")
                self._nlp = None
        return self._nlp

    def extract(self, raw_text: str) -> ExtractedResume:
        """
        Extract structured resume data from raw text.

        Args:
            raw_text: The raw text content of the resume.

        Returns:
            ExtractedResume with all extracted fields.
        """
        cleaned = clean_text(raw_text)
        sections = split_into_sections(raw_text)

        # Extract contact info
        email = extract_email(cleaned)
        phone = extract_phone(cleaned)
        name = self._extract_name(cleaned)

        # Extract skills
        skill_data = extract_skills_from_text(cleaned)

        # Extract structured sections
        education = self._extract_education(sections, cleaned)
        projects = self._extract_projects(sections)
        experience = self._extract_experience(sections)
        internships = self._extract_internships(sections)
        certifications = self._extract_certifications(sections)

        return ExtractedResume(
            full_name=name,
            email=email,
            phone=phone,
            education=education,
            skills=skill_data['skills'],
            programming_languages=skill_data['programming_languages'],
            frameworks=skill_data['frameworks'],
            databases=skill_data['databases'],
            projects=projects,
            experience=experience,
            internships=internships,
            certifications=certifications,
            raw_text=raw_text,
        )

    def _extract_name(self, text: str) -> str:
        """Extract candidate name using NLP NER or heuristics."""
        nlp = self._get_nlp()
        if nlp:
            doc = nlp(text[:500])  # Only check beginning
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text

        # Fallback: first line of resume is often the name
        lines = text.strip().split('\n')
        for line in lines[:3]:
            line = line.strip()
            if 2 <= len(line.split()) <= 4 and not re.search(r'[@\d]', line):
                return line
        return ""

    def _extract_education(self, sections: dict, full_text: str) -> list[Education]:
        """Extract education entries from resume."""
        education_entries = []

        edu_text = ""
        for key in sections:
            if re.search(r'(?i)education|academic|qualification', key):
                edu_text = sections[key]
                break

        if not edu_text:
            edu_text = full_text

        # Common degree patterns
        degree_patterns = [
            r'(?i)(B\.?Tech|B\.?E\.?|Bachelor\s+of\s+(?:Technology|Engineering))',
            r'(?i)(M\.?Tech|M\.?E\.?|Master\s+of\s+(?:Technology|Engineering))',
            r'(?i)(B\.?Sc|Bachelor\s+of\s+Science)',
            r'(?i)(M\.?Sc|Master\s+of\s+Science)',
            r'(?i)(BCA|Bachelor\s+of\s+Computer\s+Application)',
            r'(?i)(MCA|Master\s+of\s+Computer\s+Application)',
            r'(?i)(MBA|Master\s+of\s+Business\s+Administration)',
            r'(?i)(B\.?Com|Bachelor\s+of\s+Commerce)',
            r'(?i)(Ph\.?D|Doctor\s+of\s+Philosophy)',
            r'(?i)(Diploma)',
            r'(?i)(HSC|Higher\s+Secondary)',
            r'(?i)(SSC|Secondary\s+School)',
        ]

        for pattern in degree_patterns:
            match = re.search(pattern, edu_text)
            if match:
                degree = match.group(1)

                # Try to find institution nearby
                institution = ""
                context = edu_text[max(0, match.start() - 100):match.end() + 200]

                # Look for year
                year_match = re.search(r'20[0-3]\d', context)
                graduation_year = int(year_match.group()) if year_match else None

                # Look for CGPA
                cgpa = None
                cgpa_match = re.search(r'(?i)(?:cgpa|gpa|percentage)[:\s]*(\d+\.?\d*)', context)
                if cgpa_match:
                    cgpa = float(cgpa_match.group(1))

                education_entries.append(Education(
                    degree=degree,
                    institution=institution,
                    graduation_year=graduation_year,
                    cgpa=cgpa,
                ))

        return education_entries

    def _extract_projects(self, sections: dict) -> list[Project]:
        """Extract project entries from resume sections."""
        projects = []

        proj_text = ""
        for key in sections:
            if re.search(r'(?i)project', key):
                proj_text = sections[key]
                break

        if not proj_text:
            return projects

        # Split by bullet points or numbered items
        items = re.split(r'\n(?=[\•\-\d])', proj_text)
        for item in items:
            item = item.strip()
            if len(item) < 10:
                continue

            lines = item.split('\n')
            title = lines[0].strip().lstrip('•-0123456789. ')
            description = ' '.join(lines[1:]).strip() if len(lines) > 1 else ""

            # Extract technologies mentioned
            tech_data = extract_skills_from_text(item)

            projects.append(Project(
                title=title[:200],
                description=description[:1000],
                technologies=tech_data['skills'][:20],
            ))

        return projects[:10]  # Limit

    def _extract_experience(self, sections: dict) -> list[Experience]:
        """Extract work experience entries."""
        experiences = []

        exp_text = ""
        for key in sections:
            if re.search(r'(?i)experience|employment|work', key):
                exp_text = sections[key]
                break

        if not exp_text:
            return experiences

        # Simple heuristic: split by patterns that look like company/role headers
        items = re.split(r'\n(?=[A-Z])', exp_text)
        for item in items:
            item = item.strip()
            if len(item) < 15:
                continue

            lines = item.split('\n')
            first_line = lines[0].strip()
            description = ' '.join(lines[1:]).strip()

            # Try to parse "Role at Company" or "Company - Role"
            role_match = re.match(r'^(.+?)(?:\s+at\s+|\s*[-–|]\s*)(.+?)$', first_line)
            if role_match:
                role = role_match.group(1).strip()
                company = role_match.group(2).strip()
            else:
                role = first_line
                company = ""

            experiences.append(Experience(
                company=company,
                role=role,
                description=description[:1000],
            ))

        return experiences[:10]

    def _extract_internships(self, sections: dict) -> list[Internship]:
        """Extract internship entries."""
        internships = []

        intern_text = ""
        for key in sections:
            if re.search(r'(?i)internship', key):
                intern_text = sections[key]
                break

        if not intern_text:
            return internships

        items = re.split(r'\n(?=[\•\-\d])', intern_text)
        for item in items:
            item = item.strip()
            if len(item) < 10:
                continue

            lines = item.split('\n')
            first_line = lines[0].strip().lstrip('•-0123456789. ')
            description = ' '.join(lines[1:]).strip()

            internships.append(Internship(
                company="",
                role=first_line,
                description=description[:1000],
            ))

        return internships[:10]

    def _extract_certifications(self, sections: dict) -> list[str]:
        """Extract certifications from resume."""
        cert_text = ""
        for key in sections:
            if re.search(r'(?i)certification|course|training', key):
                cert_text = sections[key]
                break

        if not cert_text:
            return []

        certs = []
        for line in cert_text.split('\n'):
            line = line.strip().lstrip('•-0123456789. ')
            if len(line) > 5:
                certs.append(line[:200])

        return certs[:20]


# Module-level singleton
resume_extractor = ResumeExtractor()
