from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime

class DocumentBase(BaseModel):
    """Base document fields"""
    filename: str
    file_path: str
    vendor_name: Optional[str] = None
    document_date: Optional[date] = None
    total_amount: Optional[float] = None
    document_type: Optional[str] = None
    extracted_text: Optional[str] = None

class DocumentCreate(DocumentBase):
    """For creating new documents"""
    pass

class DocumentResponse(DocumentBase):
    """Response model with ID and timestamp"""
    id: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class SearchFilters(BaseModel):
    """Search query parameters"""
    text_query: Optional[str] = None
    vendor_name: Optional[str] = None
    document_type: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    amount_min: Optional[float] = None
    amount_max: Optional[float] = None

class DocumentUpdate(BaseModel):
    vendor_name: Optional[str] = None
    document_date: Optional[date] = None
    total_amount: Optional[float] = None
    document_type: Optional[str] = None

    @field_validator('document_date', mode='before')
    def date_validator(cls, document_date):
        if document_date == "":
            return None
        else:
            return document_date
        