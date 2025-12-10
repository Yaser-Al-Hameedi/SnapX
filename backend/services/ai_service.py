from openai import OpenAI
from config import AI_API_KEY
import json

def extract_fields(text: str) -> dict:
    client = OpenAI(api_key=AI_API_KEY)

    prompt = f"""
    Extract from OCR text (may have errors):

    - vendor_name: The FIRST/HIGHEST company name with logo at the very top. This is usually the largest text or has a company logo. Skip any names that appear below it. NEVER use "BILL TO"/"SHIP TO" sections. Vendor name will never be Saba Petroleum LLC
    - document_date: Date from "DATE" or "Invoice Date" field (YYYY-MM-DD)
    - total_amount: The main payment amount - look for "Total", "Balance Due", "Amount Due", "Installment Amount", or the largest monetary value. If multiple amounts exist, prioritize non-zero values. Return number only.
    - document_type: "receipt", "invoice", "bill", "statement", or "other"

    Use null if uncertain. Convert dates to YYYY-MM-DD.

    {text}

    JSON: {{"vendor_name": "...", "document_date": "YYYY-MM-DD", "total_amount": 0.00, "document_type": "..."}}
    """

    response = client.chat.completions.create(
    model="gpt-4o-mini",  
    messages=[
        {"role": "system", "content": "You are a document extraction expert."},
        {"role": "user", "content": prompt}
    ],
    response_format={"type": "json_object"}
    )

    json_response = response.choices[0].message.content
    info_response = json.loads(json_response)

    return info_response
