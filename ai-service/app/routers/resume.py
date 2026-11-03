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


@router.post("/parse", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse an uploaded resume file (PDF or DOCX) and extract structured data.

    Returns extracted candidate profile with skills, education, experience, etc.
    """
    filename = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()

    is_pdf = filename.endswith(".pdf") or "pdf" in content_type
    is_docx = filename.endswith(".docx") or filename.endswith(".doc") or "word" in content_type or "officedocument" in content_type

    if not is_pdf and not is_docx:
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
    if is_pdf:
        raw_text = extract_text_from_pdf(file_bytes)
    else:
        raw_text = extract_text_from_docx(file_bytes)

    if not raw_text:
        return ResumeParseResponse(
            success=False,
            error="Could not extract text from the uploaded file. Please ensure it is not image-based or password-protected."
        )

    # Extract structured data
    try:
        extracted = resume_extractor.extract(raw_text)
        return ResumeParseResponse(success=True, data=extracted)
    except Exception as e:
        logger.error(f"Resume extraction failed: {e}", exc_info=True)
        return ResumeParseResponse(
            success=False,
            error=f"Failed to process resume structure: {str(e)}"
        )
