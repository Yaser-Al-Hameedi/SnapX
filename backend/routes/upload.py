from fastapi import APIRouter, UploadFile, File, HTTPException
from models import DocumentCreate, DocumentResponse
from database import get_supabase_client, upload_file_to_storage
import os
import re
import shutil
from datetime import datetime
from services import ocr_service
from services import ai_service
from services import clean_image_service
from mimetypes import guess_type
import uuid

router = APIRouter() # This is for all upload-related enpoints

TEMP_FOLDER = "temp_uploads" # Temporary folder for OCR and LLM
os.makedirs(TEMP_FOLDER, exist_ok=True)


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    
    temp_file_path = os.path.join(TEMP_FOLDER, file.filename) # Temporary file path for OCR and LLM

    try:
        with open(temp_file_path, "wb") as buffer: # Opening the temp path
            shutil.copyfileobj(file.file, buffer) # Copying uploaded file to the temp path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    image_for_preview = os.path.join(TEMP_FOLDER, f"original_{file.filename}") # Copying image before process for preview
    shutil.copy(temp_file_path, image_for_preview)
    
    mime_type, _ = guess_type(temp_file_path)
    if mime_type and mime_type.startswith('image/'):
        clean_image_service.clean_image(temp_file_path)
    
    extracted_text = ocr_service.extract_text(temp_file_path) # Extracting File Text
    
    
    ai_data = ai_service.extract_fields(extracted_text) # Creating dict of all file info

    #Preparing final storage path
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    unique_filename = re.sub(r'[^\w\-.]', '_', unique_filename)
    storage_path = f"{ai_data['document_type']}/{datetime.now().year}/{datetime.now().month}/{unique_filename}"

    try:
        with open(image_for_preview, "rb") as f:
            file_data = f.read()
        
        public_url = upload_file_to_storage(
            file_path=storage_path,
            file_data=file_data,
            content_type=file.content_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to storage: {str(e)}")
    

    # Saving data to database
    try:
        supabase = get_supabase_client()

        document_data = {
            "filename": file.filename,
            "file_path": public_url,
            "vendor_name": ai_data.get("vendor_name"),
            "document_date": ai_data.get("document_date"),
            "total_amount": ai_data.get("total_amount"),
            "document_type": ai_data.get("document_type"),
            "extracted_text": extracted_text
        }

        result = supabase.table("documents").insert(document_data).execute()

        if not result.data:
            raise Exception("Faild to insert into database")
        
        saved_document = result.data[0]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save to database: {str(e)}")
    
    # Removing the Temporary file

    try:
        os.remove(temp_file_path)
        os.remove(image_for_preview)
    except Exception:
        pass

    return DocumentResponse(**saved_document)
    


