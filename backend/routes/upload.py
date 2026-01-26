from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from models import TaskResponse
import os
import base64
import logging
from routes.tasks import process_document_task
from celery_app import celery_app
from database import supabase, get_supabase_client

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter() # This is for all upload-related enpoints

# Admin user (unlimited uploads)
ADMIN_USER_ID = os.getenv("ADMIN_USER_ID")
# Upload limit for regular users
USER_UPLOAD_LIMIT = 30


@router.post("/upload", response_model=TaskResponse)
async def upload_document(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    # Verify user authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization token")

    token = authorization.replace("Bearer ", "")

    # Verify token with Supabase and get user_id
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    # Check upload limit for non-admin users (per-request check to prevent race conditions)
    if user_id != ADMIN_USER_ID:
        supabase_client = get_supabase_client()
        result = supabase_client.table("documents").select("id", count="exact").eq("user_id", user_id).execute()
        current_count = result.count or 0

        # Check if this single upload would exceed the limit
        if current_count >= USER_UPLOAD_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"Upload limit reached. You have {current_count}/{USER_UPLOAD_LIMIT} documents."
            )

    # Read file bytes and encode as base64 for Celery task
    try:
        file_bytes = await file.read()
        file_data_b64 = base64.b64encode(file_bytes).decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

    # Pass file data (base64) to Celery task instead of file paths
    logger.info(f"[DEBUG] About to send task for file: {file.filename}")
    logger.info(f"[DEBUG] Celery broker URL: {celery_app.conf.broker_url[:30]}...")

    try:
        result = process_document_task.delay(file_data_b64, file.filename, file.content_type, user_id)
        logger.info(f"[DEBUG] Task sent successfully! Task ID: {result.id}")
        logger.info(f"[DEBUG] Task state: {result.state}")
    except Exception as e:
        logger.error(f"[DEBUG] Failed to send task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to queue task: {str(e)}")

    return {
        "task_id": result.id,
        "status": "processing",
        "message": "File queued for processing"
    }
    


