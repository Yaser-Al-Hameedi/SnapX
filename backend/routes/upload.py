from fastapi import APIRouter, UploadFile, File, HTTPException
from models import DocumentCreate, DocumentResponse
from database import get_supabase_client, upload_file_to_storage
import os
import shutil
from datetime import datetime

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

    # Step 2: OCR - Extract text (we'll implement this in ocr_service.py)
    # extracted_text = ocr_service.extract_text(temp_file_path)
    extracted_text = "Placeholder extracted text"
    
    # Step 3: AI - Extract fields (we'll implement this in ai_service.py)
    # ai_data = ai_service.extract_fields(extracted_text)
    ai_data = {
        "vendor_name": "Test Vendor",
        "document_date": "2024-10-08",
        "total_amount": 45.99,
        "document_type": "receipt"
    }

    #Preparing final storage path
    storage_path = f"{ai_data['document_type']}/{datetime.now().year}/{datetime.now().month}/{file.filename}"

    try:
        with open(temp_file_path, "rb") as f:
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
            "extracted_text": ai_data.get("extracted_text")
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
    except Exception:
        pass

    return DocumentResponse(**saved_document)
    


