from celery import Celery

# Create Celery app instance
celery_app = Celery(
    "snapx",  # Name of your project
    broker="redis://localhost:6379/0",  # Redis connection for task queue
    backend="redis://localhost:6379/0"  # Redis connection for storing task results
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
)

# Import tasks AFTER celery_app is defined (prevents circular import)
from routes import tasks
