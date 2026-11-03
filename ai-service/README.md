# NexHire AI Service

AI-powered resume parsing and job matching microservice for the NexHire platform.

## Features

- **Resume Parsing**: Extract structured data from PDF and DOCX resumes
  - Contact information (name, email, phone)
  - Education details with CGPA and graduation year
  - Skills categorized into languages, frameworks, databases
  - Projects with technologies used
  - Work experience and internships
  - Certifications

- **AI Job Matching**: Hybrid matching engine using:
  - Semantic similarity (Sentence Transformers)
  - Skill-based matching with comprehensive taxonomy
  - Experience compatibility scoring
  - Location preference matching
  - Graduation batch eligibility verification
  - Job freshness scoring
  - Configurable weights for each component

## Tech Stack

- **Framework**: FastAPI
- **NLP**: spaCy (NER), Sentence Transformers (embeddings)
- **Document Parsing**: PyMuPDF (PDF), python-docx (DOCX)
- **ML**: scikit-learn, numpy

## Quick Start

### Local Development

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy environment file
copy .env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Docker

```bash
docker build -t nexhire-ai .
docker run -p 8000:8000 nexhire-ai
```

## API Endpoints

| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| POST   | `/api/resume/parse`    | Parse uploaded resume (PDF/DOCX) |
| POST   | `/api/matching/match`  | Match candidate against jobs   |
| GET    | `/health`              | Health check                   |
| GET    | `/docs`                | Swagger UI documentation       |
| GET    | `/redoc`               | ReDoc documentation            |

## Running Tests

```bash
pytest tests/ -v
```

## Project Structure

```
ai-service/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py             # Settings (pydantic-settings)
│   ├── routers/
│   │   ├── resume.py         # Resume parsing endpoints
│   │   └── matching.py       # Job matching endpoints
│   ├── services/
│   │   ├── pdf_parser.py     # PDF text extraction (PyMuPDF)
│   │   ├── docx_parser.py    # DOCX text extraction (python-docx)
│   │   ├── resume_extractor.py  # Resume data extraction orchestrator
│   │   ├── skill_extractor.py   # Skill taxonomy and extraction
│   │   ├── embeddings.py     # Sentence Transformer embeddings
│   │   └── matcher.py        # AI matching engine
│   ├── models/
│   │   ├── resume.py         # Resume Pydantic models
│   │   └── matching.py       # Matching Pydantic models
│   └── utils/
│       └── text_processing.py  # Text utilities
├── tests/
│   ├── test_resume_parser.py
│   └── test_matcher.py
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## Environment Variables

| Variable          | Default              | Description                     |
|-------------------|----------------------|---------------------------------|
| `DEBUG`           | `false`              | Enable debug mode               |
| `HOST`            | `0.0.0.0`            | Server host                     |
| `PORT`            | `8000`               | Server port                     |
| `SPACY_MODEL`     | `en_core_web_sm`     | spaCy NLP model                 |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2`   | Sentence Transformer model      |
| `BACKEND_URL`     | `http://localhost:5000` | Backend API URL              |
| `MAX_FILE_SIZE_MB`| `10`                 | Max upload file size in MB      |
