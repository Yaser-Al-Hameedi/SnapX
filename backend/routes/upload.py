from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from models import TaskResponse
import os
import shutil
from routes.tasks import process_document_task
from database import supabase, get_supabase_client

router = APIRouter() # This is for all upload-related enpoints

TEMP_FOLDER = "temp_uploads" # Temporary folder for OCR and LLM
os.makedirs(TEMP_FOLDER, exist_ok=True)

# Admin user (unlimited uploads)
ADMIN_USER_ID = os.getenv("ADMIN_USER_ID")
# Upload limit for regular users
USER_UPLOAD_LIMIT = 30


@router.post("/upload", response_model=TaskResponse)
async def upload_document(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    import uuid

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

    # Generate unique filenames to prevent collisions when uploading multiple files
    unique_id = str(uuid.uuid4())
    temp_file_path = os.path.join(TEMP_FOLDER, f"{unique_id}_{file.filename}") # Temporary file path for OCR and LLM

    try:
        with open(temp_file_path, "wb") as buffer: # Opening the temp path
            shutil.copyfileobj(file.file, buffer) # Copying uploaded file to the temp path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    image_for_preview = os.path.join(TEMP_FOLDER, f"original_{unique_id}_{file.filename}") # Copying image before process for preview
    shutil.copy(temp_file_path, image_for_preview)

    # Pass user_id to the Celery task
    result = process_document_task.delay(temp_file_path, image_for_preview, file.filename, file.content_type, user_id)

    return {
        "task_id": result.id,
        "status": "processing",
        "message": "File queued for processing"
    }
    


