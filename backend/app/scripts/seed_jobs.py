import os
import logging
from bson import json_util
from app.database import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_jobs")

def seed():
    db = get_db()
    seed_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "jobs.json")
    if not os.path.exists(seed_file):
        logger.error(f"Seed file not found: {seed_file}")
        return

    with open(seed_file, "r", encoding="utf-8") as f:
        jobs = json_util.loads(f.read())

    db["jobpostings"].delete_many({})
    db["jobpostings"].insert_many(jobs)
    logger.info(f"Successfully seeded {len(jobs)} jobs into {db.name}.jobpostings collection.")

if __name__ == "__main__":
    seed()

