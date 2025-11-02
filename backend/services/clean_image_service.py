import cv2

def clean_image(filepath: str):
    read_image = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)

    if read_image is None:
        raise Exception(f"Image failed to process")
    
    cleaned_image = cv2.adaptiveThreshold(read_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

    if cleaned_image is None:
        raise Exception(f"Image failed to clean")

    cv2.imwrite(filepath, cleaned_image)



    