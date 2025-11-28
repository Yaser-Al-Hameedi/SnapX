from openai import OpenAI
from config import AI_API_KEY
import json

def extract_fields(text: str) -> dict:
    client = OpenAI(api_key=AI_API_KEY)

    prompt = f"""
    You are a document extraction expert. Extract the following fields from this document text:

    Required fields:
    - vendor_name: The business/company name (if present)
    - document_date: The document date in YYYY-MM-DD format (if present)
    - total_amount: The total amount as a number without currency symbols (if present)
    - document_type: Classify as one of: "receipt", "invoice", "bill", "statement", or "other"
    - due_date: Grab the due date in YYYY-MM-DD format (if present)

    Rules:
    - Return ONLY valid JSON with these exact field names
    - If document is a bill, grab the due date and place it as the due date
    - Use null for any field you cannot confidently extract
    - For document_date, convert any date format to YYYY-MM-DD
    - For total_amount, extract only the number (e.g., 45.99 not $45.99)
    - Be conservative - if unsure, use null rather than guessing

    Document text:
    {text}

    Return format:
    {{"vendor_name": "...", "document_date": "YYYY-MM-DD", "total_amount": 0.00, "document_type": "..."}}
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
