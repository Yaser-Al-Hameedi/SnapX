from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
from typing import List

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

class TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str

class StatusResponse(BaseModel):
    tasks: List[TaskResponse]

class StoreCreate(BaseModel):
    name: str

class BookeepingEntry(BaseModel):
    store_id: str
    entry_date: date
    income: float
    payouts: float
    tax: float

class BookeepingUpdate(BaseModel):
    income: Optional[float] = None
    payouts: Optional[float] = None
    tax: Optional[float] = None

class LotteryEntryCreate(BaseModel):
    store_id: str
    week_start: date
    week_end: date
    amount: float

class LotteryEntryUpdate(BaseModel):
    week_start: Optional[date] = None
    week_end: Optional[date] = None
    amount: Optional[float] = None

class VendorCreate(BaseModel):
    name: str

class VendorPaymentCreate(BaseModel):
    store_id: str
    vendor_id: str
    amount: float
    payment_date: date

class VendorPaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_date: Optional[date] = None

class EmployeeCreate(BaseModel):
    store_id: str
    name: str
    last_name:str
    hourly_rate: float 

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    hourly_rate: Optional[float] = None

class ShiftCreate(BaseModel):
    clock_in: datetime
    clock_out: datetime
    store_id: str
    employee_id: str

class ShiftUpdate(BaseModel):
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    
