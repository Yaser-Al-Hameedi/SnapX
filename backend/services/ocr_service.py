import pytesseract
from PIL import Image
from pdf2image import convert_from_path
def extract_text(file_path: str) -> str: 
    if file_path.endswith('pdf'): 
        images = convert_from_path(file_path) # Returns a list of images converted from pdf
    else:
        images = [Image.open(file_path)] # If not a pdf, we open the file and retrieve a list of that
    
    text = ""
    for image in images:
        extracted_text = pytesseract.image_to_string(image) # Run OCR on each image
        text += extracted_text
    
    return text

