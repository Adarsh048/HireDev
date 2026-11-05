import logging
from datetime import datetime
from bson import ObjectId
from argon2 import PasswordHasher
from app.database import get_db
from app.services.matching_service import run_matching_cycle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_demo")

def seed():
    db = get_db()
    email = "demo.engineer@nexhire.in"
    
    # 1. Ensure user
    ph = PasswordHasher()
    hashed = ph.hash("Password123!")
    user = db["users"].find_one({"email": email})
    if not user:
        res = db["users"].insert_one({
            "email": email,
            "name": "Demo Software Engineer",
            "passwordHash": hashed,
            "role": "candidate",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        })
        user_id = str(res.inserted_id)
        logger.info(f"Created demo user: {user_id}")
    else:
        user_id = str(user["_id"])
        db["users"].update_one({"_id": user["_id"]}, {"$set": {"passwordHash": hashed}})
        logger.info(f"Updated demo user password: {user_id}")

    # 2. Seed rich candidate profile
    profile_data = {
        "user": user_id,
        "fullName": "Aarav Sharma",
        "email": email,
        "phone": "+91 98765 43210",
        "education": [
            {
                "degree": "B.Tech in Computer Science and Engineering",
                "institution": "National Institute of Technology (NIT)",
                "graduationYear": 2024,
                "cgpa": 8.7,
            }
        ],
        "skills": [
            "React", "TypeScript", "JavaScript", "Node.js", "Python",
            "FastAPI", "MongoDB", "PostgreSQL", "Docker", "Tailwind CSS",
            "REST APIs", "Git", "Next.js", "Redis"
        ],
        "languages": ["Python", "JavaScript", "TypeScript"],
        "frameworks": ["React", "FastAPI", "Next.js", "Express", "Node.js"],
        "databases": ["MongoDB", "PostgreSQL", "Redis"],
        "projects": [
            {
                "title": "Cloud-Native Task Orchestration Engine",
                "description": "High-throughput asynchronous task scheduler using FastAPI, Redis, and React dashboard.",
                "technologies": ["Python", "FastAPI", "Redis", "Docker", "React"],
                "link": "https://github.com/demo/cloud-orchestrator",
            },
            {
                "title": "Real-Time Collaborative Code Editor",
                "description": "WebRTC and WebSocket powered live code sharing platform with syntax highlighting.",
                "technologies": ["React", "TypeScript", "Node.js", "WebSocket"],
                "link": "https://github.com/demo/code-collab",
            }
        ],
        "experience": [
            {
                "company": "TechInnovate Labs",
                "role": "Software Development Engineer Intern",
                "startDate": "2024-01-10",
                "endDate": "2024-06-30",
                "description": "Engineered high-concurrency microservices in Python & TypeScript, optimizing API response times by 35%.",
                "isCurrentRole": False,
            }
        ],
        "internships": [],
        "certifications": ["AWS Certified Cloud Practitioner", "PostgreSQL Certified Developer"],
        "preferences": {
            "jobCategories": ["Software Engineering", "Full Stack", "Backend"],
            "preferredLocations": ["Bangalore", "Hyderabad", "Remote", "Pune"],
            "workMode": ["remote", "hybrid", "on-site"],
            "employmentTypes": ["full-time"],
        },
        "updatedAt": datetime.utcnow(),
    }

    db["candidateprofiles"].update_one(
        {"$or": [{"user": user_id}, {"user": ObjectId(user_id)}]},
        {"$set": profile_data},
        upsert=True
    )
    logger.info("Candidate profile initialized.")

    # 3. Trigger calibrated matching
    batch_id = run_matching_cycle(user_id)
    recs_count = db["recommendations"].count_documents({"user": user_id})
    logger.info(f"Demo recommendations seeded: batch {batch_id}, total {recs_count} matched jobs.")

if __name__ == "__main__":
    seed()

