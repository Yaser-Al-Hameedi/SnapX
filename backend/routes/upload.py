from fastapi import APIRouter, UploadFile, File, HTTPException
from models import TaskResponse
import os
import shutil
from routes.tasks import process_document_task

router = APIRouter() # This is for all upload-related enpoints

TEMP_FOLDER = "temp_uploads" # Temporary folder for OCR and LLM
os.makedirs(TEMP_FOLDER, exist_ok=True)


@router.post("/upload", response_model=TaskResponse)
async def upload_document(file: UploadFile = File(...)):
    import uuid

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

    result = process_document_task.delay(temp_file_path, image_for_preview, file.filename, file.content_type)

    return {
        "task_id": result.id,
        "status": "processing",
        "message": "File queued for processing"
    }
    


