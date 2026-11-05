# DevLaunch 🚀

> AI-Powered Tech Career & Job Discovery Platform for Developers (0–2 YOE & Early Career Tech Talent).

DevLaunch connects tech candidates to verified opportunities across 6 major platforms (**LinkedIn, Naukri, Indeed, Internshala, Foundit, and Wellfound**). It uses natural language processing (spaCy + PyMuPDF) to parse resumes, and a calibrated hybrid matching engine (TF-IDF + semantic embeddings + skill taxonomy) to score and rank opportunities with **80%+ relevance** and 100% direct employer ATS application links.

---

## 🏛️ System Architecture

```
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│     Frontend      │───▶│    Backend API    │───▶│    AI Service     │
│   React / Vite    │    │  Express / TS     │    │  FastAPI / Python │
│   Port: 5173 / 80 │    │  Port: 5000       │    │  Port: 8000       │
└───────────────────┘    └─────────┬─────────┘    └───────────────────┘
                                   │
                          ┌────────┴────────┐
                          │                 │
                     ┌────▼────┐       ┌────▼────┐
                     │ MongoDB │       │  Redis  │
                     │  27017  │       │  6379   │
                     └─────────┘       └─────────┘
```

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Radix UI, TanStack Query |
| **Backend API** | Node.js 20, Express, TypeScript, Mongoose, Argon2id, JWT, Zod, Helmet, Multer |
| **AI Microservice** | Python 3.11, FastAPI, PyMuPDF, spaCy (`en_core_web_sm`), Sentence Transformers / Scikit-Learn |
| **Datastores** | MongoDB (Primary DB) + Redis (Queue / BullMQ / Rate Limiting) |

---

## 🚀 Quick Start & Deployment

### 🔒 Confidentiality & Environment Setup
All confidential credentials, secrets, and user resumes are excluded from version control via `.gitignore`.

1. Copy `.env.example` to create your local `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your secure values (generate random keys for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`).

---

### Option A — One-Click Production Deployment with Docker Compose

Ensure Docker and Docker Compose are installed:

```bash
# 1. Build and start all services in production mode
docker compose up --build -d

# 2. Seed 60 verified tech openings across 6 platforms
docker compose exec backend npm run seed
```

Access points:
- **Web App**: [http://localhost](http://localhost) (or `http://localhost:5173`)
- **Backend API**: [http://localhost:5000](http://localhost:5000) (Health: `/health`)
- **AI Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B — Local Development Setup

#### 1. Backend Service
```bash
cd backend
cp .env.example .env
npm install
npm run seed      # Seeds 60 verified genuine tech opportunities
npm run dev       # Starts Express dev server on port 5000
```

#### 2. AI Matching Service
```bash
cd ai-service
cp .env.example .env
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Frontend Web App
```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # Starts Vite dev server on port 5173
```

---

## 🛡️ Security & Privacy Practices

- **Zero-Secret Commits**: All `.env`, `.env.*`, `.pem`, `.key` files are strictly gitignored. Only `.env.example` templates with placeholder values are committed.
- **Candidate Data Privacy**: Uploaded resumes (`uploads/`, `*.pdf`, `*.docx`) are gitignored and never tracked in public repositories.
- **Authentication**: JWT access (15m) and refresh (7d) tokens with Argon2id password hashing and HTTP-only cookie support.
- **API Defense**: Helmet headers, CORS origin allowlisting, rate limiting (`express-rate-limit`), and Zod input validation on all routes.

---

## 📦 Production Build

```bash
# Frontend production build
cd frontend
npm run build     # Outputs optimized bundle to frontend/dist

# Backend production build
cd backend
npm run build     # Outputs compiled JavaScript to backend/dist
npm start         # Runs compiled server
```

---

## 📄 License
MIT License. Built for modern tech job discovery in India.
