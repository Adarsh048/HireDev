# NexHire AI

> India-focused AI-powered job discovery and career intelligence platform.

NexHire helps Indian job seekers discover relevant employment opportunities by
analyzing their resumes and finding the best matching jobs across multiple job
portals and company career pages.

---

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Frontend   │───▶│   Backend    │───▶│  AI Service  │
│  React/Vite │    │ Express/Node │    │   FastAPI     │
│  Port 5173  │    │  Port 5000   │    │  Port 8000   │
└─────────────┘    └──────┬───────┘    └──────────────┘
                          │
                 ┌────────┴────────┐
                 │                 │
            ┌────▼─────┐    ┌─────▼────┐
            │ MongoDB  │    │  Redis   │
            │ Port 27017│    │ Port 6379│
            └──────────┘    └──────────┘
```

| Component       | Stack                                     |
|----------------|-------------------------------------------|
| Frontend       | React, TypeScript, Vite, Tailwind, shadcn/ui |
| Backend API    | Node.js, Express, TypeScript, Mongoose     |
| AI Service     | Python, FastAPI, spaCy, Sentence Transformers |
| Database       | MongoDB Atlas                              |
| Queue / Cache  | Redis + BullMQ                             |
| Auth           | JWT (access + refresh), Argon2id           |

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- MongoDB (local or Atlas)
- Redis
- Docker & Docker Compose (optional)

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env            # Edit secrets
docker-compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173         |
| Backend   | http://localhost:5000         |
| AI Docs   | http://localhost:8000/docs    |

### Option B — Manual

#### 1. Backend

```bash
cd backend
cp .env.example .env            # Edit secrets
npm install
npm run dev
```

#### 2. AI Service

```bash
cd ai-service
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
NexHire/
├── backend/            # Node.js Express API
├── frontend/           # React SPA
├── ai-service/         # Python FastAPI microservice
├── docker-compose.yml  # Local development stack
├── .env.example        # Environment template
└── README.md
```

See each sub-project's README for detailed documentation.

---

## Development Phases

| #  | Phase                               | Status        |
|----|-------------------------------------|---------------|
| 1  | Architecture & scaffolding          | ✅ Complete    |
| 2  | Authentication & user management    | 🔲 Pending    |
| 3  | Resume upload & AI parsing          | 🔲 Pending    |
| 4  | First job-source integration        | 🔲 Pending    |
| 5  | Normalization & deduplication       | 🔲 Pending    |
| 6  | AI matching & eligibility engine    | 🔲 Pending    |
| 7  | Recommendation dashboard            | 🔲 Pending    |
| 8  | Additional job-source integrations  | 🔲 Pending    |
| 9  | Redis, BullMQ & automatic refresh   | 🔲 Pending    |
| 10 | Career intelligence features        | 🔲 Pending    |
| 11 | Security, testing & deployment      | 🔲 Pending    |

---

## License

Private — all rights reserved.

