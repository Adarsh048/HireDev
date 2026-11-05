"""DOCX resume text extraction using python-docx."""
from docx import Document
from typing import Optional
import io
import logging

logger = logging.getLogger(__name__)


def extract_text_from_docx(file_bytes: bytes) -> Optional[str]:
    """
    Extract text content from a DOCX file.

    Args:
        file_bytes: Raw bytes of the DOCX file.

    Returns:
        Extracted text as a string, or None if extraction fails.
    """
    try:
        doc = Document(io.BytesIO(file_bytes))
        text_parts = []

        # Extract from paragraphs
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text)

        # Extract from tables
        for table in doc.tables:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    if cell.text.strip():
                        row_text.append(cell.text.strip())
                if row_text:
                    text_parts.append(" | ".join(row_text))

        full_text = "\n".join(text_parts)
        if not full_text.strip():
            logger.warning("DOCX extraction returned empty text")
            return None

        return full_text
    except Exception as e:
        logger.error(f"Failed to extract text from DOCX: {e}")
        return None
