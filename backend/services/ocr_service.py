import os
import json
import base64
from google.cloud import vision
from google.oauth2 import service_account

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

    with open(file_path, 'rb') as f:
        content = f.read()

    if file_path.lower().endswith('.pdf'):
        # For PDFs, use document text detection
        image = vision.Image(content=content)
        response = client.document_text_detection(image=image)
    else:
        # For images, use text detection
        image = vision.Image(content=content)
        response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"Vision API error: {response.error.message}")

    # Get full text from response
    if response.text_annotations:
        return response.text_annotations[0].description

    return ""
