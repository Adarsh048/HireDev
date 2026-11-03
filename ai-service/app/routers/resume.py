"""Resume parsing API router."""
from fastapi import APIRouter, UploadFile, File, HTTPException
import logging

from app.models.resume import ResumeParseResponse
from app.services.pdf_parser import extract_text_from_pdf
from app.services.docx_parser import extract_text_from_docx
from app.services.resume_extractor import resume_extractor
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resume", tags=["Resume"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}


@router.post("/parse", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse an uploaded resume file (PDF or DOCX) and extract structured data.

    Returns extracted candidate profile with skills, education, experience, etc.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Accepted: PDF, DOCX"
        )

    # Read file
    file_bytes = await file.read()

    # Validate file size
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Extract text
    file_type = ALLOWED_TYPES[file.content_type]
    if file_type == "pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    else:
        raw_text = extract_text_from_docx(file_bytes)

    if not raw_text:
        return ResumeParseResponse(
            success=False,
            error="Could not extract text from the uploaded file. Please ensure it's not image-based or encrypted."
        )

    # Extract structured data
    try:
        extracted = resume_extractor.extract(raw_text)
        return ResumeParseResponse(success=True, data=extracted)
    except Exception as e:
        logger.error(f"Resume extraction failed: {e}", exc_info=True)
        return ResumeParseResponse(
            success=False,
            error="Failed to process resume. Please try again."
        )
