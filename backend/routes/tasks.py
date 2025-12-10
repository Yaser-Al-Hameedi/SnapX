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
import time

@celery_app.task(name='process_document_task')
def process_document_task(temp_file_path: str, image_for_preview: str, original_filename: str, content_type: str):
    try:
        start_time = time.time()

        # Verify files exist before processing
        if not os.path.exists(temp_file_path):
            raise Exception(f"Temp file not found: {temp_file_path}")
        if not os.path.exists(image_for_preview):
            raise Exception(f"Preview file not found: {image_for_preview}")

        # Image preprocessing
        #preprocess_start = time.time()
        #mime_type, _ = guess_type(temp_file_path)
        #if mime_type and mime_type.startswith('image/'):
            #clean_image_service.clean_image(temp_file_path)
        #print(f"[{original_filename}] Preprocessing: {time.time() - preprocess_start:.2f}s")

        # OCR extraction
        ocr_start = time.time()
        extracted_text = ocr_service.extract_text(temp_file_path)
        print(f"[{original_filename}] OCR: {time.time() - ocr_start:.2f}s")

        # AI field extraction
        ai_start = time.time()
        ai_data = ai_service.extract_fields(extracted_text)
        print(f"[{original_filename}] AI extraction: {time.time() - ai_start:.2f}s")

        # Preparing final storage path
        unique_filename = f"{uuid.uuid4()}_{original_filename}"
        unique_filename = re.sub(r'[^\w\-.]', '_', unique_filename)
        storage_path = f"{ai_data['document_type']}/{datetime.now().year}/{datetime.now().month}/{unique_filename}"

        # Upload to storage
        with open(image_for_preview, "rb") as f:
            file_data = f.read()

        public_url = upload_file_to_storage(
            file_path=storage_path,
            file_data=file_data,
            content_type=content_type
        )

        # Save to database
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

        # Cleanup temp files
        try:
            os.remove(temp_file_path)
            os.remove(image_for_preview)
        except Exception:
            pass

        print(f"[{original_filename}] TOTAL TIME: {time.time() - start_time:.2f}s")
        return saved_document

    except Exception as e:
        # Cleanup temp files on any failure
        try:
            os.remove(temp_file_path)
            os.remove(image_for_preview)
        except Exception:
            pass
        raise Exception(f"Failed to process {original_filename}: {str(e)}")
