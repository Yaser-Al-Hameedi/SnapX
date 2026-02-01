import os
import json
import base64
import io
from google.cloud import vision
from google.oauth2 import service_account
from pdf2image import convert_from_path

def get_vision_client():
    """Initialize Google Cloud Vision client from environment variable"""
    credentials_b64 = os.getenv("GOOGLE_CREDENTIALS_BASE64")

    if credentials_b64:
        # Production: decode base64 credentials from env var
        credentials_json = base64.b64decode(credentials_b64).decode('utf-8')
        credentials_dict = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_dict)
        return vision.ImageAnnotatorClient(credentials=credentials)
    else:
        # Local dev: use default credentials or GOOGLE_APPLICATION_CREDENTIALS
        return vision.ImageAnnotatorClient()

def extract_text(file_path: str) -> str:
    """Extract text from image or PDF using Google Cloud Vision API"""
    client = get_vision_client()

    if file_path.lower().endswith('.pdf'):
        # Convert PDF pages to images, then OCR each
        images = convert_from_path(file_path)
        all_text = []

        for image in images:
            # Convert PIL image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            content = img_byte_arr.getvalue()

            vision_image = vision.Image(content=content)
            response = client.text_detection(image=vision_image)

            if response.error.message:
                raise Exception(f"Vision API error: {response.error.message}")

            if response.text_annotations:
                all_text.append(response.text_annotations[0].description)

        return "\n".join(all_text)
    else:
        # For images, read and send directly
        with open(file_path, 'rb') as f:
            content = f.read()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)

        if response.error.message:
            raise Exception(f"Vision API error: {response.error.message}")

        if response.text_annotations:
            return response.text_annotations[0].description

        return ""
