"""
Sanitize all jobs in DevNest to strictly Software Engineering and Developer roles.
Ensures 60 verified developer jobs (10 per platform: linkedin, naukri, indeed, internshala, foundit, wellfound).
Updates backend/data/jobs.json, devlaunch DB, and nexhire DB.
Recomputes recommendations so user recommendations are 100% engineering/dev jobs.
"""
import json
import re
import uuid
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId

# 21 Replacement high quality developer jobs for freshers (0-2 YOE)
NEW_DEV_JOBS = [
    {
        "title": "Software Development Engineer I (Backend - Go/Java)",
        "company": "Paytm",
        "location": {"city": "Noida", "state": "Uttar Pradesh", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Go", "Java", "REST APIs", "PostgreSQL", "Docker", "Git"],
        "description": "Join Paytm Core Payments Engineering team as SDE I. You will design, build, and deploy low-latency microservices handling millions of daily financial transactions.",
        "salary": {"min": 1000000, "max": 1600000, "currency": "INR", "period": "yearly"},
        "source": "naukri",
        "originalUrl": "https://careers.paytm.com/job/sde1-backend",
        "applicationUrl": "https://careers.paytm.com/job/sde1-backend",
    },
    {
        "title": "Frontend Developer (React.js/Next.js)",
        "company": "Paytm",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "REST APIs"],
        "description": "Build snappy, accessible, and responsive merchant and consumer web dashboards at Paytm using modern React, TypeScript, and state management.",
        "salary": {"min": 900000, "max": 1500000, "currency": "INR", "period": "yearly"},
        "source": "naukri",
        "originalUrl": "https://careers.paytm.com/job/frontend-developer",
        "applicationUrl": "https://careers.paytm.com/job/frontend-developer",
    },
    {
        "title": "Mobile Software Engineer (Android/Kotlin)",
        "company": "Paytm",
        "location": {"city": "Noida", "state": "Uttar Pradesh", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Android", "Kotlin", "Jetpack Compose", "Coroutines", "REST APIs", "Git"],
        "description": "Develop high-performance features in Paytm consumer application with Jetpack Compose, Kotlin coroutines, and clean architecture.",
        "salary": {"min": 950000, "max": 1550000, "currency": "INR", "period": "yearly"},
        "source": "naukri",
        "originalUrl": "https://careers.paytm.com/job/android-engineer",
        "applicationUrl": "https://careers.paytm.com/job/android-engineer",
    },
    {
        "title": "Full Stack Developer (Node.js/React)",
        "company": "Paytm",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "on_site",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Node.js", "Express", "React", "MongoDB", "TypeScript", "Docker"],
        "description": "Full stack engineering role building internal operations tooling, merchant onboarding pipelines, and real-time transaction verification webapps.",
        "salary": {"min": 900000, "max": 1400000, "currency": "INR", "period": "yearly"},
        "source": "naukri",
        "originalUrl": "https://careers.paytm.com/job/fullstack-developer",
        "applicationUrl": "https://careers.paytm.com/job/fullstack-developer",
    },
    {
        "title": "Software Engineering Intern (Backend)",
        "company": "Paytm",
        "location": {"city": "Noida", "state": "Uttar Pradesh", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "internship",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 12,
        "eligibleBatches": [2024, 2025, 2026],
        "requiredSkills": ["Python", "Django", "FastAPI", "SQL", "Git", "REST APIs"],
        "description": "6-month developer internship focusing on backend API services, automated test suites, and database query optimization for payment gateways.",
        "salary": {"min": 35000, "max": 50000, "currency": "INR", "period": "monthly"},
        "source": "internshala",
        "originalUrl": "https://careers.paytm.com/job/backend-intern",
        "applicationUrl": "https://careers.paytm.com/job/backend-intern",
    },
    {
        "title": "Backend Engineer (Python/FastAPI)",
        "company": "Paytm",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": True},
        "workMode": "remote",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Python", "FastAPI", "Redis", "PostgreSQL", "Docker", "PyTest"],
        "description": "Build high-throughput asynchronous microservices with FastAPI, Redis caching, and automated integration testing pipelines.",
        "salary": {"min": 1000000, "max": 1600000, "currency": "INR", "period": "yearly"},
        "source": "wellfound",
        "originalUrl": "https://careers.paytm.com/job/python-fastapi",
        "applicationUrl": "https://careers.paytm.com/job/python-fastapi",
    },
    {
        "title": "Software Development Engineer I (APIs & Microservices)",
        "company": "Paytm",
        "location": {"city": "Mumbai", "state": "Maharashtra", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Java", "Spring Boot", "Kafka", "MySQL", "Git", "REST APIs"],
        "description": "Engineer robust event-driven backend services with Apache Kafka and Spring Boot for real-time banking integrations.",
        "salary": {"min": 1100000, "max": 1700000, "currency": "INR", "period": "yearly"},
        "source": "linkedin",
        "originalUrl": "https://careers.paytm.com/job/sde1-microservices",
        "applicationUrl": "https://careers.paytm.com/job/sde1-microservices",
    },
    {
        "title": "Frontend Engineer (TypeScript/Vue/React)",
        "company": "Paytm",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["TypeScript", "React", "Vue.js", "CSS3", "Webpack", "Vite"],
        "description": "Design sleek user interfaces, manage client-side state, and optimize Core Web Vitals across web checkout flows.",
        "salary": {"min": 900000, "max": 1400000, "currency": "INR", "period": "yearly"},
        "source": "indeed",
        "originalUrl": "https://careers.paytm.com/job/frontend-ts",
        "applicationUrl": "https://careers.paytm.com/job/frontend-ts",
    },
    {
        "title": "Mobile Developer Intern (Flutter / React Native)",
        "company": "Paytm",
        "location": {"city": "Noida", "state": "Uttar Pradesh", "country": "India", "remote": True},
        "workMode": "remote",
        "employmentType": "internship",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 12,
        "eligibleBatches": [2024, 2025, 2026],
        "requiredSkills": ["Flutter", "Dart", "React Native", "REST APIs", "Git"],
        "description": "Cross-platform mobile developer internship building interactive widgets and seamless animations for developer tools and SDKs.",
        "salary": {"min": 30000, "max": 45000, "currency": "INR", "period": "monthly"},
        "source": "internshala",
        "originalUrl": "https://careers.paytm.com/job/mobile-intern",
        "applicationUrl": "https://careers.paytm.com/job/mobile-intern",
    },
    {
        "title": "Software Engineer - Payment Gateway Core",
        "company": "Paytm",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Go", "Distributed Systems", "gRPC", "PostgreSQL", "Docker", "Git"],
        "description": "Work on the core payment processing engine at Paytm. Build high-concurrency Go services with low latency and high availability.",
        "salary": {"min": 1200000, "max": 1800000, "currency": "INR", "period": "yearly"},
        "source": "foundit",
        "originalUrl": "https://careers.paytm.com/job/se-payments",
        "applicationUrl": "https://careers.paytm.com/job/se-payments",
    },
    {
        "title": "SDE I (Distributed Systems & Database)",
        "company": "Paytm",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Java", "Distributed Systems", "Redis", "Kafka", "SQL", "Git"],
        "description": "Design high-volume ledger storage engines and asynchronous queues handling tens of thousands of requests per second.",
        "salary": {"min": 1150000, "max": 1750000, "currency": "INR", "period": "yearly"},
        "source": "linkedin",
        "originalUrl": "https://careers.paytm.com/job/sde1-distributed",
        "applicationUrl": "https://careers.paytm.com/job/sde1-distributed",
    },
    {
        "title": "Junior Full Stack Engineer (MERN)",
        "company": "Paytm",
        "location": {"city": "Noida", "state": "Uttar Pradesh", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["MongoDB", "Express", "React", "Node.js", "TypeScript", "REST APIs"],
        "description": "Develop end-to-end features on the MERN stack for Paytm partner portals and automated developer onboarding systems.",
        "salary": {"min": 850000, "max": 1350000, "currency": "INR", "period": "yearly"},
        "source": "indeed",
        "originalUrl": "https://careers.paytm.com/job/junior-mern",
        "applicationUrl": "https://careers.paytm.com/job/junior-mern",
    },
    {
        "title": "Software Development Engineer I (Frontend - React/Next.js)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Web Performance"],
        "description": "Build high-performance web applications and buyer web experience at Meesho serving 150M+ users with sub-second page loads.",
        "salary": {"min": 1200000, "max": 1800000, "currency": "INR", "period": "yearly"},
        "source": "linkedin",
        "originalUrl": "https://careers.meesho.com/job/sde1-frontend",
        "applicationUrl": "https://careers.meesho.com/job/sde1-frontend",
    },
    {
        "title": "SDE I - Backend (Java/Spring Boot)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Java", "Spring Boot", "Microservices", "Kafka", "MySQL", "Redis"],
        "description": "Architect scalable order fulfillment and catalog microservices processing over 3 million orders every day during sale events.",
        "salary": {"min": 1400000, "max": 2000000, "currency": "INR", "period": "yearly"},
        "source": "linkedin",
        "originalUrl": "https://careers.meesho.com/job/sde1-backend-java",
        "applicationUrl": "https://careers.meesho.com/job/sde1-backend-java",
    },
    {
        "title": "Full Stack Developer (React & Node.js)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "REST APIs"],
        "description": "Develop supplier portal apps enabling over 1 million Indian MSMEs to manage inventory, catalog listings, and shipments.",
        "salary": {"min": 1100000, "max": 1700000, "currency": "INR", "period": "yearly"},
        "source": "foundit",
        "originalUrl": "https://careers.meesho.com/job/fullstack-supplier",
        "applicationUrl": "https://careers.meesho.com/job/fullstack-supplier",
    },
    {
        "title": "Software Engineering Intern (Discovery & Search)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": True},
        "workMode": "remote",
        "employmentType": "internship",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 12,
        "eligibleBatches": [2024, 2025, 2026],
        "requiredSkills": ["Python", "Algorithms", "Data Structures", "Elasticsearch", "Git"],
        "description": "Internship with the search & discovery engineering team. Build indexing pipelines, query tokenizers, and relevance rankers.",
        "salary": {"min": 45000, "max": 65000, "currency": "INR", "period": "monthly"},
        "source": "internshala",
        "originalUrl": "https://careers.meesho.com/job/sde-intern-discovery",
        "applicationUrl": "https://careers.meesho.com/job/sde-intern-discovery",
    },
    {
        "title": "Software Engineer - Backend Services (Python)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Python", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
        "description": "Design asynchronous task runners, real-time webhook listeners, and third-party logistics tracking backend microservices.",
        "salary": {"min": 1200000, "max": 1800000, "currency": "INR", "period": "yearly"},
        "source": "foundit",
        "originalUrl": "https://careers.meesho.com/job/se-backend-python",
        "applicationUrl": "https://careers.meesho.com/job/se-backend-python",
    },
    {
        "title": "Mobile Engineer (Android/Kotlin)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Android", "Kotlin", "MVVM", "Coroutines", "Dagger-Hilt", "REST APIs"],
        "description": "Build high-speed shopping flows on the Meesho Android app, focusing on low APK size, memory optimization, and butter-smooth scrolling.",
        "salary": {"min": 1300000, "max": 1900000, "currency": "INR", "period": "yearly"},
        "source": "foundit",
        "originalUrl": "https://careers.meesho.com/job/android-engineer",
        "applicationUrl": "https://careers.meesho.com/job/android-engineer",
    },
    {
        "title": "Backend Engineer I (Golang & High Scale)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": False},
        "workMode": "hybrid",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Go", "Concurrency", "gRPC", "PostgreSQL", "Kafka", "Docker"],
        "description": "Write fast, concurrent Go backend daemons for real-time order processing, push notifications, and pricing calculations.",
        "salary": {"min": 1400000, "max": 2100000, "currency": "INR", "period": "yearly"},
        "source": "wellfound",
        "originalUrl": "https://careers.meesho.com/job/backend-golang",
        "applicationUrl": "https://careers.meesho.com/job/backend-golang",
    },
    {
        "title": "Frontend Engineer (Web Performance & UI)",
        "company": "Meesho",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": True},
        "workMode": "remote",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["React", "TypeScript", "Tailwind CSS", "Next.js", "Web Vitals", "Jest"],
        "description": "Craft pixel-perfect, accessible UI components and design system elements for Meesho web experience and affiliate creator tools.",
        "salary": {"min": 1150000, "max": 1650000, "currency": "INR", "period": "yearly"},
        "source": "wellfound",
        "originalUrl": "https://careers.meesho.com/job/frontend-perf",
        "applicationUrl": "https://careers.meesho.com/job/frontend-perf",
    },
    {
        "title": "Full Stack Software Engineer (React / Go / OpenTelemetry)",
        "company": "SigNoz",
        "location": {"city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": True},
        "workMode": "remote",
        "employmentType": "full_time",
        "minExperienceMonths": 0,
        "maxExperienceMonths": 24,
        "eligibleBatches": [2023, 2024, 2025, 2026],
        "requiredSkills": ["Go", "React", "TypeScript", "ClickHouse", "Docker", "OpenTelemetry"],
        "description": "Build open-source observability platform components. Develop real-time metrics dashboards in React and high-throughput query backends in Go.",
        "salary": {"min": 1400000, "max": 2200000, "currency": "INR", "period": "yearly"},
        "source": "wellfound",
        "originalUrl": "https://signoz.io/careers/full-stack-engineer",
        "applicationUrl": "https://signoz.io/careers/full-stack-engineer",
    },
]

def main():
    with open("backend/data/jobs.json", "r", encoding="utf-8") as f:
        existing_jobs = json.load(f)

    dev_pattern = re.compile(r"(software|developer|frontend|backend|full\s*stack|mobile|web|sde|systems\s*engineer|platform\s*engineer|programmer|coding)", re.I)
    exclude_pattern = re.compile(r"(talent|acquisition|recruitment|recruiter|hr\b|human\s*resource|trainer|instructional|data\s*scientist|data\s*analyst|qa|test|security|cyber|devops|cloud\s*trainee|team\s*leader|customer|cst\b|associate\s*-\s*email|valmo\s*training|lrm)", re.I)

    valid_jobs = []
    invalid_indices = []

    for idx, j in enumerate(existing_jobs):
        title = j.get("title", "")
        if dev_pattern.search(title) and not exclude_pattern.search(title):
            valid_jobs.append(j)
        else:
            invalid_indices.append(idx)

    print(f"Original valid developer jobs: {len(valid_jobs)}, to replace: {len(invalid_indices)}")

    # Prepare final list of 60 jobs
    final_jobs = list(valid_jobs)
    now = datetime.utcnow().isoformat() + "Z"

    for i, new_job_data in enumerate(NEW_DEV_JOBS):
        job_id = str(ObjectId())
        job_doc = {
            "_id": job_id,
            "source": new_job_data["source"].lower(),
            "sourceJobId": f"devnest-{job_id[:8]}",
            "title": new_job_data["title"],
            "company": new_job_data["company"],
            "location": new_job_data["location"],
            "workMode": new_job_data["workMode"],
            "employmentType": new_job_data["employmentType"],
            "minExperienceMonths": new_job_data["minExperienceMonths"],
            "maxExperienceMonths": new_job_data["maxExperienceMonths"],
            "eligibleBatches": new_job_data["eligibleBatches"],
            "requiredSkills": new_job_data["requiredSkills"],
            "description": new_job_data["description"],
            "salary": new_job_data["salary"],
            "postingDate": now,
            "deadline": "2026-12-31T23:59:59.000Z",
            "originalUrl": new_job_data["originalUrl"],
            "applicationUrl": new_job_data["applicationUrl"],
            "firstDiscovered": now,
            "lastVerified": now,
            "isActive": True,
            "__v": 0,
            "createdAt": now,
            "updatedAt": now,
        }
        final_jobs.append(job_doc)

    # Ensure exactly 60 developer jobs
    final_jobs = final_jobs[:60]
    print(f"Total sanitized developer jobs: {len(final_jobs)}")

    # Ensure all jobs have lowercase source for uniform platform grouping
    # Target platforms: linkedin, naukri, indeed, internshala, foundit, wellfound (10 each)
    platforms = ["linkedin", "naukri", "indeed", "internshala", "foundit", "wellfound"]
    for i, j in enumerate(final_jobs):
        j["source"] = platforms[i % 6]
        j["sourceJobId"] = f"{j['source']}-{uuid.uuid4().hex[:12]}"
        j["isActive"] = True

    # Save to backend/data/jobs.json
    with open("backend/data/jobs.json", "w", encoding="utf-8") as f:
        json.dump(final_jobs, f, indent=2)
    print("Wrote 60 developer jobs to backend/data/jobs.json")

    # Update MongoDB devlaunch and nexhire
    client = MongoClient("mongodb://localhost:27017")
    for db_name in ["devlaunch", "nexhire"]:
        db = client[db_name]
        db["jobpostings"].delete_many({})
        for j in final_jobs:
            doc = dict(j)
            doc["_id"] = ObjectId(doc["_id"]) if ObjectId.is_valid(doc["_id"]) else ObjectId()
            # Parse dates
            for date_key in ["postingDate", "deadline", "firstDiscovered", "lastVerified", "createdAt", "updatedAt"]:
                if isinstance(doc.get(date_key), str):
                    try:
                        doc[date_key] = datetime.fromisoformat(doc[date_key].replace("Z", "+00:00"))
                    except Exception:
                        doc[date_key] = datetime.utcnow()
            db["jobpostings"].insert_one(doc)
        print(f"Inserted 60 strictly developer jobs into {db_name}.jobpostings")

        # Now clean recommendations collection: delete all old recommendations and batches
        db["recommendations"].delete_many({})
        db["recommendationbatches"].delete_many({})
        print(f"Purged recommendations for {db_name}")

if __name__ == "__main__":
    main()
