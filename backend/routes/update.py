from fastapi import APIRouter, HTTPException
from database import get_supabase_client
from models import DocumentUpdate, DocumentResponse

router = APIRouter()

@router.patch("/documents/{document_id}", response_model=DocumentResponse)
async def update_document(update_data: DocumentUpdate, document_id: str):
    
    supabase = get_supabase_client()

    update_fields = update_data.model_dump(mode= 'json')

    query = supabase.table("documents").update(update_fields).eq("id", document_id)

    result = query.execute()
    if not result.data:
        raise HTTPException(status_code=404, detail = f"resource not found")
    
    #print("Result data:", result.data[0])
    return DocumentResponse(**result.data[0])
