#!/bin/bash
set -e

# Wait for DB to be ready (simple sleep for now, better to use wait-for-it)
sleep 5

# Initialize Aerich if not initialized (this is tricky in docker, usually done locally)
# For this setup, we'll assume we just run upgrade if it exists, or init-db
# But simpler for now:
# aerich upgrade

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
