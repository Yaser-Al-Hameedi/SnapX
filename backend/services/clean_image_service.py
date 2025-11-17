import cv2
import numpy as np

def clean_image(filepath: str):
    read_image = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)

    if read_image is None:
        raise Exception(f"Image failed to process")
    
    # Step 1: Denoise
    denoised = cv2.fastNlMeansDenoising(read_image, None, 10, 7, 21)
    
    # Step 2: Enhance contrast (CLAHE - Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    contrasted = clahe.apply(denoised)
    
    # Step 3: Threshold (what you had before)
    cleaned_image = cv2.adaptiveThreshold(
        contrasted, 
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 
        11, 
        2
    )

    if cleaned_image is None:
        raise Exception(f"Image failed to clean")

    cv2.imwrite(filepath, cleaned_image)
    