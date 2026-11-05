from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017')
for db_name in ['nexhire', 'devlaunch']:
    db = client[db_name]
    for coll_name in ['recommendationbatches', 'recommendations', 'candidateprofiles', 'savedjobs', 'applications']:
        coll = db[coll_name]
        docs = list(coll.find({}))
        updated = 0
        for doc in docs:
            user_val = doc.get('user')
            updates = {}
            if isinstance(user_val, str) and ObjectId.is_valid(user_val):
                updates['user'] = ObjectId(user_val)
                updated += 1
            job_val = doc.get('job')
            if isinstance(job_val, str) and ObjectId.is_valid(job_val):
                updates['job'] = ObjectId(job_val)
            batch_val = doc.get('batch')
            if isinstance(batch_val, str) and ObjectId.is_valid(batch_val):
                updates['batch'] = ObjectId(batch_val)
            if updates:
                coll.update_one({'_id': doc['_id']}, {'$set': updates})
        print(f'{db_name}.{coll_name}: Updated {updated} string users to ObjectId')
