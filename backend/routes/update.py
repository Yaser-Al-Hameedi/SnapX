from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_supabase_client
from typing import Optional
from datetime import date

router = APIRouter()

class DocumentUpdate(BaseModel):
    vendor_name: Optional[str] = None
    document_date: Optional[date] = None
    total_amount: Optional[float] = None
    document_type: Optional[str] = None

@router.patch("/documents/{document_id}")
async def update_document(document_id: str, updates: DocumentUpdate):
    supabase = get_supabase_client()
    
    # Build update dict with only provided fields
    update_data = {}
    if updates.vendor_name is not None:
        update_data["vendor_name"] = updates.vendor_name
    if updates.document_date is not None:
        update_data["document_date"] = str(updates.document_date)
    if updates.total_amount is not None:
        update_data["total_amount"] = updates.total_amount
    if updates.document_type is not None:
        update_data["document_type"] = updates.document_type
    
    try:
        result = supabase.table("documents").update(update_data).eq("id", document_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")