"""PDF resume text extraction using PyMuPDF."""
import fitz  # PyMuPDF
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes) -> Optional[str]:
    """
    Extract text content from a PDF file (bytes or file path).

    Args:
        file_bytes: Raw bytes of the PDF file, or path string.

    Returns:
        Extracted text as a string, or None if extraction fails.
    """
    try:
        if isinstance(file_bytes, str):
            doc = fitz.open(file_bytes)
        else:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                text_parts.append(text)
        doc.close()

        full_text = "\n".join(text_parts)
        if not full_text.strip():
            logger.warning("PDF extraction returned empty text")
            return None

        return full_text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        return None
