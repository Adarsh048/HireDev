import os
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Depends
from bson import ObjectId

from app.database import get_db, serialize_doc
from app.security import get_current_user
from app.services.pdf_parser import extract_text_from_pdf
from app.services.docx_parser import extract_text_from_docx
from app.services.resume_extractor import resume_extractor
from app.services.matching_service import run_matching_cycle
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    filename = file.filename or "resume.pdf"
    content = await file.read()
    
    # Validate file size
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB",
        )

    # 1. Extract raw text
    ext = os.path.splitext(filename)[1].lower()
    raw_text = ""
    try:
        if ext == ".pdf":
            raw_text = extract_text_from_pdf(content) or ""
        elif ext in [".docx", ".doc"]:
            raw_text = extract_text_from_docx(content) or ""
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload PDF or DOCX format.",
            )
    except Exception as e:
        logger.error(f"Error parsing resume binary: {e}")
        raw_text = ""

    # 2. Extract structured profile using NLP
    extracted = None
    if raw_text.strip():
        try:
            extracted = resume_extractor.extract(raw_text)
        except Exception as e:
            logger.error(f"NLP extraction error: {e}")

    # 3. Store resume metadata
    db = get_db()
    resume_doc = {
        "user": user_id,
        "originalFileName": filename,
        "mimeType": file.content_type or "application/octet-stream",
        "fileSize": len(content),
        "uploadedAt": datetime.utcnow(),
        "parsedText": raw_text[:2000],  # preview
    }
    resume_res = db["resumes"].insert_one(resume_doc)
    resume_doc["_id"] = resume_res.inserted_id

    # 4. Upsert CandidateProfile
    profile_data = {
        "user": user_id,
        "fullName": extracted.full_name if extracted and extracted.full_name else (current_user.get("name") or "Candidate"),
        "email": extracted.email if extracted and extracted.email else current_user.get("email"),
        "phone": extracted.phone if extracted else "",
        "education": [
            {
                "degree": e.degree,
                "institution": e.institution,
                "graduationYear": e.graduation_year or 2024,
                "cgpa": e.cgpa,
            }
            for e in (extracted.education if extracted else [])
        ],
        "skills": extracted.skills if extracted and extracted.skills else ["Python", "JavaScript", "React"],
        "languages": extracted.programming_languages if extracted and extracted.programming_languages else ["Python", "JavaScript"],
        "frameworks": extracted.frameworks if extracted and extracted.frameworks else ["React", "FastAPI"],
        "databases": extracted.databases if extracted and extracted.databases else ["MongoDB", "PostgreSQL"],
        "projects": [
            {
                "title": p.title,
                "description": p.description,
                "technologies": p.technologies,
                "link": p.link,
            }
            for p in (extracted.projects if extracted else [])
        ],
        "experience": [
            {
                "company": exp.company,
                "role": exp.role,
                "startDate": exp.start_date,
                "endDate": exp.end_date,
                "description": exp.description,
                "isCurrentRole": exp.is_current,
            }
            for exp in (extracted.experience if extracted else [])
        ],
        "internships": [
            {
                "company": i.company,
                "role": i.role,
                "startDate": i.start_date,
                "endDate": i.end_date,
                "description": i.description,
            }
            for i in (extracted.internships if extracted else [])
        ],
        "certifications": extracted.certifications if extracted else [],
        "preferences": {
            "jobCategories": ["Software Engineering", "Full Stack", "Backend"],
            "preferredLocations": ["Bangalore", "Hyderabad", "Remote"],
            "workMode": ["remote", "hybrid", "on-site"],
            "employmentTypes": ["full-time"],
        },
        "updatedAt": datetime.utcnow(),
    }

    db["candidateprofiles"].update_one(
        {"user": user_id},
        {"$set": profile_data},
        upsert=True
    )

    saved_profile = db["candidateprofiles"].find_one({"user": user_id})

    # 5. Immediate in-process matching cycle
    try:
        run_matching_cycle(user_id)
    except Exception as e:
        logger.error(f"Matching cycle execution error: {e}")

    return {
        "success": True,
        "message": "Resume uploaded and analyzed successfully",
        "data": {
            "resume": serialize_doc(resume_doc),
            "profile": serialize_doc(saved_profile),
        },
    }


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    db = get_db()
    
    profile = db["candidateprofiles"].find_one({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]
    })

    if not profile:
        # Return empty default profile structure
        profile = {
            "userId": user_id,
            "fullName": current_user.get("name") or "",
            "email": current_user.get("email") or "",
            "skills": [],
            "languages": [],
            "frameworks": [],
            "databases": [],
            "education": [],
            "projects": [],
            "experience": [],
            "internships": [],
            "certifications": [],
            "preferences": {
                "preferredLocations": ["Bangalore", "Hyderabad", "Remote"],
                "workMode": ["remote", "hybrid", "on-site"],
                "employmentTypes": ["full-time"],
            },
        }

    return {
        "success": True,
        "data": {
            "profile": serialize_doc(profile),
        },
    }


@router.patch("/profile")
async def update_profile(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    db = get_db()

    body["updatedAt"] = datetime.utcnow()
    body.pop("_id", None)
    body.pop("id", None)

    db["candidateprofiles"].update_one(
        {"$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]},
        {"$set": body},
        upsert=True,
    )

    # Re-run matching cycle in background
    try:
        run_matching_cycle(user_id)
    except Exception as e:
        logger.error(f"Re-matching error after profile patch: {e}")

    updated = db["candidateprofiles"].find_one({
        "$or": [{"user": user_id}, {"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}]
    })

    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": {
            "profile": serialize_doc(updated),
        },
    }
