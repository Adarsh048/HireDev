"""Text preprocessing utilities for resume parsing."""
import re
from typing import List


def clean_text(text: str) -> str:
    """Remove extra whitespace and special characters."""
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text


def extract_email(text: str) -> str | None:
    """Extract email address from text."""
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    """Extract Indian phone number from text."""
    patterns = [
        r'(?:\+91[\-\s]?)?[6-9]\d{9}',  # Indian mobile
        r'(?:\+91[\-\s]?)?[0-9]{2,4}[\-\s]?[0-9]{6,8}',  # Landline
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return None


def extract_urls(text: str) -> List[str]:
    """Extract URLs from text."""
    pattern = r'https?://[^\s<>\"\']+|www\.[^\s<>\"\']+'
    return re.findall(pattern, text)


def normalize_skill(skill: str) -> str:
    """Normalize a skill name for consistent matching."""
    skill = skill.strip().lower()
    # Common normalizations
    normalizations = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'node': 'node.js',
        'react.js': 'react',
        'reactjs': 'react',
        'vue.js': 'vue',
        'vuejs': 'vue',
        'angular.js': 'angular',
        'angularjs': 'angular',
        'next.js': 'nextjs',
        'express.js': 'express',
        'mongo': 'mongodb',
        'postgres': 'postgresql',
        'k8s': 'kubernetes',
        'tf': 'tensorflow',
        'ml': 'machine learning',
        'dl': 'deep learning',
        'ai': 'artificial intelligence',
        'aws': 'amazon web services',
        'gcp': 'google cloud platform',
    }
    return normalizations.get(skill, skill)


def split_into_sections(text: str) -> dict[str, str]:
    """
    Attempt to split resume text into sections based on common headings.
    Returns dict of section_name -> section_content.
    """
    section_patterns = [
        r'(?i)(education|academic|qualification)',
        r'(?i)(experience|employment|work\s*history)',
        r'(?i)(skill|technical\s*skill|competenc)',
        r'(?i)(project)',
        r'(?i)(internship)',
        r'(?i)(certification|course|training)',
        r'(?i)(objective|summary|about)',
        r'(?i)(contact|personal\s*(?:info|detail))',
        r'(?i)(achievement|award|honor)',
        r'(?i)(publication|research)',
    ]

    # Find all section headers and their positions
    sections: dict[str, str] = {}
    header_positions = []

    lines = text.split('\n')
    for i, line in enumerate(lines):
        clean_line = line.strip()
        if len(clean_line) < 50:  # Section headers are typically short
            for pattern in section_patterns:
                if re.search(pattern, clean_line):
                    header_positions.append((i, clean_line))
                    break

    # Extract content between headers
    for idx, (line_num, header) in enumerate(header_positions):
        next_line = header_positions[idx + 1][0] if idx + 1 < len(header_positions) else len(lines)
        content = '\n'.join(lines[line_num + 1:next_line]).strip()
        # Normalize header name
        header_key = header.strip().lower()
        for pattern in section_patterns:
            match = re.search(pattern, header_key)
            if match:
                header_key = match.group(1).strip()
                break
        sections[header_key] = content

    return sections
