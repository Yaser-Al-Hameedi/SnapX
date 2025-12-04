import pytesseract
from PIL import Image
from pdf2image import convert_from_path
def extract_text(file_path: str) -> str:
    if file_path.endswith('pdf'):
        images = convert_from_path(file_path) # Returns a list of images converted from pdf
    else:
        image = Image.open(file_path)
        # Resize large images to prevent memory issues (max 4500px on longest side)
        MAX_DIMENSION = 4500
        if max(image.size) > MAX_DIMENSION:
            image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
        images = [image]
    
    text = ""
    for image in images:
        extracted_text = pytesseract.image_to_string(image) # Run OCR on each image
        text += extracted_text
    
    return text

