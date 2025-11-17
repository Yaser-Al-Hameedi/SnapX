from fastapi import APIRouter
from models import SearchFilters
from database import get_supabase_client

router = APIRouter()

@router.get("/search")
async def search_documents(text_query: str = None,
    vendor_name: str = None,
    document_type: str = None,
    date_from: str = None,
    date_to: str = None,
    amount_min: float = None,
    amount_max: float = None):

    filters = SearchFilters(
        text_query=text_query,
        vendor_name=vendor_name,
        document_type=document_type,
        date_from=date_from,
        date_to=date_to,
        amount_min=amount_min,
        amount_max=amount_max
    )
    
    supabase = get_supabase_client()

    query = supabase.table("documents").select("*")

    if filters.vendor_name:
        query = query.ilike("vendor_name", f"%{filters.vendor_name}%")

    if filters.document_type:
        query = query.eq("document_type", filters.document_type)
    
    if filters.date_from:
        query = query.gte("document_date", filters.date_from)
    
    if filters.date_to:
        query = query.lte("document_date", filters.date_to)
    
    if filters.amount_min:
        query = query.gte("total_amount", filters.amount_min)
    
    if filters.amount_max:
        query = query.lte("total_amount", filters.amount_max)
    
    if filters.text_query:
        query = query.ilike("extracted_text", f"%{filters.text_query}%")
    
    result = query.execute()
    return result.data
    