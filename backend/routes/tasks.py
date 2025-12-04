from celery_app import celery_app
from database import get_supabase_client, upload_file_to_storage
from models import DocumentResponse
import os
import re
import shutil
from datetime import datetime
from services import ocr_service
from services import ai_service
from services import clean_image_service
from mimetypes import guess_type
import uuid

@celery_app.task(name='process_document_task')
def process_document_task(temp_file_path: str, image_for_preview: str, original_filename: str, content_type: str):

    mime_type, _ = guess_type(temp_file_path)
    if mime_type and mime_type.startswith('image/'):
        clean_image_service.clean_image(temp_file_path)

    extracted_text = ocr_service.extract_text(temp_file_path) # Extracting File Text


    ai_data = ai_service.extract_fields(extracted_text) # Creating dict of all file info

    #Preparing final storage path
    unique_filename = f"{uuid.uuid4()}_{original_filename}"
    unique_filename = re.sub(r'[^\w\-.]', '_', unique_filename)
    storage_path = f"{ai_data['document_type']}/{datetime.now().year}/{datetime.now().month}/{unique_filename}"

    try:
        with open(image_for_preview, "rb") as f:
            file_data = f.read()

        public_url = upload_file_to_storage(
            file_path=storage_path,
            file_data=file_data,
            content_type=content_type
        )
    except Exception as e:
        raise Exception(f"Failed to upload to storage: {str(e)}")


    # Saving data to database
    try:
        supabase = get_supabase_client()

        document_data = {
            "filename": original_filename,
            "file_path": public_url,
            "vendor_name": ai_data.get("vendor_name"),
            "document_date": ai_data.get("document_date"),
            "total_amount": ai_data.get("total_amount"),
            "document_type": ai_data.get("document_type"),
            "extracted_text": extracted_text
        }

        result = supabase.table("documents").insert(document_data).execute()

        if not result.data:
            raise Exception("Failed to insert into database")

        saved_document = result.data[0]

    except Exception as e:
        raise Exception("Failed to save to database")

    # Removing the Temporary file

    try:
        os.remove(temp_file_path)
        os.remove(image_for_preview)
    except Exception:
        pass

    return saved_document
