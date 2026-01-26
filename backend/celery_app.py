import os
import ssl
import logging
from celery import Celery

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get Redis URL from environment (Upstash for production, localhost for dev)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
logger.info(f"[CELERY] Using broker URL: {REDIS_URL[:30]}..." if len(REDIS_URL) > 30 else f"[CELERY] Using broker URL: {REDIS_URL}")

# Create Celery app instance
celery_app = Celery(
    "snapx",  # Name of your project
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",  # Serialize tasks as JSON
    accept_content=["json"],  # Accept only JSON content
    result_serializer="json",  # Serialize results as JSON
    timezone="UTC",  # Use UTC timezone
    enable_utc=True,  # Enable UTC
    task_track_started=True,  # Track when tasks start (useful for progress updates)
    task_time_limit=300,  # Kill task after 5 minutes (safety limit)
    task_soft_time_limit=240,  # Warn task after 4 minutes
    task_acks_late=True,  # Acknowledge tasks only after completion (prevents lost tasks on crash)
    worker_prefetch_multiplier=1,  # Process one task at a time (prevents file conflicts)
    broker_use_ssl={"ssl_cert_reqs": ssl.CERT_NONE} if REDIS_URL.startswith("rediss://") else None,
    redis_backend_use_ssl={"ssl_cert_reqs": ssl.CERT_NONE} if REDIS_URL.startswith("rediss://") else None
)

# Import tasks AFTER celery_app is defined (prevents circular import)
from routes import tasks
