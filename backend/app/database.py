import os
import json
import logging
from datetime import datetime
from bson import ObjectId, json_util
import pymongo
from pymongo.collection import Collection
from pymongo.database import Database
from app.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client: pymongo.MongoClient = None
    db: Database = None

mongo = MongoDB()


def get_db() -> Database:
    if mongo.db is None:
        init_db()
    return mongo.db


def format_salary_str(salary) -> str:
    if not salary:
        return "Competitive"
    if isinstance(salary, str):
        return salary.strip() or "Competitive"
    if isinstance(salary, dict):
        min_v = salary.get("min")
        max_v = salary.get("max")
        period = salary.get("period", "yearly")
        is_monthly = period == "monthly" or (min_v and min_v < 100000)
        if min_v and max_v:
            if min_v >= 100000:
                min_l = min_v / 100000
                max_l = max_v / 100000
                min_s = int(min_l) if min_l.is_integer() else f"{min_l:.1f}"
                max_s = int(max_l) if max_l.is_integer() else f"{max_l:.1f}"
                return f"₹{min_s} - ₹{max_s} LPA"
            return f"₹{min_v:,} - ₹{max_v:,} / month"
        if min_v:
            return f"₹{min_v / 100000:.1f} LPA+" if min_v >= 100000 else f"₹{min_v:,}/mo+"
        if max_v:
            return f"Up to ₹{max_v / 100000:.1f} LPA" if max_v >= 100000 else f"Up to ₹{max_v:,}/mo"
    return "Competitive"


def serialize_doc(doc: dict) -> dict:
    """Helper to convert MongoDB document to JSON-serializable dict with id string."""
    if not doc:
        return doc
    
    clean = dict(doc)
    if "_id" in clean:
        clean["id"] = str(clean["_id"])
        clean["_id"] = str(clean["_id"])

    if "salary" in clean and isinstance(clean["salary"], (dict, str)):
        clean["salary"] = format_salary_str(clean["salary"])
        
    for k, v in list(clean.items()):
        if isinstance(v, ObjectId):
            clean[k] = str(v)
        elif isinstance(v, datetime):
            clean[k] = v.isoformat()
        elif isinstance(v, dict):
            clean[k] = serialize_doc(v)
        elif isinstance(v, list):
            clean[k] = [serialize_doc(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else i) for i in v]
    return clean


def init_db():
    """Initialize MongoDB connection, verify collections, and seed defaults if empty."""
    uri = settings.MONGODB_URI
    logger.info(f"Connecting to MongoDB at {uri.split('@')[-1] if '@' in uri else uri}...")
    
    mongo.client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
    
    # Determine database name from URI, default to devlaunch
    parsed_db = None
    try:
        from urllib.parse import urlparse
        parsed = urlparse(uri)
        path = parsed.path.strip("/")
        if path:
            parsed_db = path
    except Exception:
        pass
    
    db_name = parsed_db or "devlaunch"
    mongo.db = mongo.client[db_name]
    
    # Check if this db is empty but nexhire has data
    try:
        if mongo.db["jobpostings"].count_documents({}) == 0 and "nexhire" in mongo.client.list_database_names():
            if mongo.client["nexhire"]["jobpostings"].count_documents({}) > 0:
                logger.info(f"Detected existing data in 'nexhire' database. Attaching to 'nexhire'.")
                mongo.db = mongo.client["nexhire"]
    except Exception as e:
        logger.warning(f"DB list notice: {e}")

    # Create indexes
    try:
        mongo.db["users"].create_index("email", unique=True)
        mongo.db["candidateprofiles"].create_index("user", unique=True)
        mongo.db["jobpostings"].create_index("source")
        mongo.db["jobpostings"].create_index("isActive")
        mongo.db["recommendations"].create_index([("user", pymongo.ASCENDING), ("batch", pymongo.ASCENDING)])
        mongo.db["recommendations"].create_index([("user", pymongo.ASCENDING), ("platform", pymongo.ASCENDING)])
        mongo.db["savedjobs"].create_index([("user", pymongo.ASCENDING), ("job", pymongo.ASCENDING)], unique=True)
        mongo.db["applications"].create_index([("user", pymongo.ASCENDING), ("job", pymongo.ASCENDING)], unique=True)
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")

    # Seed 60 jobs if empty
    try:
        job_count = mongo.db["jobpostings"].count_documents({})
        if job_count == 0:
            seed_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "jobs.json")
            if os.path.exists(seed_file):
                logger.info("Empty database detected. Seeding 60 genuine tech openings from data/jobs.json...")
                with open(seed_file, "r", encoding="utf-8") as f:
                    jobs_data = json_util.loads(f.read())
                    if jobs_data:
                        mongo.db["jobpostings"].insert_many(jobs_data)
                        logger.info(f"Successfully seeded {len(jobs_data)} jobs into {mongo.db.name}.")
    except Exception as e:
        logger.error(f"Error seeding jobs: {e}")

    # Seed demo user if empty
    try:
        if mongo.db["users"].count_documents({"email": "demo.engineer@nexhire.in"}) == 0:
            from argon2 import PasswordHasher
            ph = PasswordHasher()
            hashed = ph.hash("Password123!")
            mongo.db["users"].insert_one({
                "email": "demo.engineer@nexhire.in",
                "name": "Demo Software Engineer",
                "passwordHash": hashed,
                "role": "candidate",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            })
            logger.info("Demo user 'demo.engineer@nexhire.in' initialized.")
    except Exception as e:
        logger.error(f"Error seeding demo user: {e}")

