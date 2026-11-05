import sys
from pathlib import Path
sys.path.insert(0, str(Path("backend").resolve()))

from pymongo import MongoClient
from app.services.matching_service import run_matching_cycle

client = MongoClient("mongodb://localhost:27017")
for db_name in ["devlaunch", "nexhire"]:
    db = client[db_name]
    profiles = list(db["candidateprofiles"].find({}))
    print(f"DB {db_name}: Found {len(profiles)} profiles")
    for p in profiles:
        user_id = str(p.get("user"))
        print(f"Running matching cycle for user {user_id} in {db_name}...")
        batch_id = run_matching_cycle(user_id)
        recs_count = db["recommendations"].count_documents({"user": user_id})
        print(f"User {user_id}: generated batch {batch_id}, total recs in db: {recs_count}")

print("Matching completed successfully!")
