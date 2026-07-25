from models import EmployeeCreate, EmployeeUpdate
from fastapi import APIRouter, HTTPException, Header
from database import supabase, get_supabase_client

router = APIRouter()

def get_user_id(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization token")
    token = authorization.replace("Bearer ", "")
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    

@router.post("/employees")
async def create_employee(employee: EmployeeCreate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    data = employee.model_dump(mode='json')
    data["user_id"] = user_id
    result = db.table("employees").insert(data).execute()
    return result.data[0]


@router.get("/employees/{store_id}")
async def get_employees(store_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    result = db.table("employees").select("*").eq("user_id", user_id).eq("store_id", store_id).execute()
    return result.data


@router.patch("/employees")
async def update_employee(employee: EmployeeUpdate, store_id: str, employee_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    update_employee = employee.model_dump(mode='json', exclude_none=True)
    result = db.table("employees").update(update_employee).eq("user_id", user_id).eq("store_id", store_id).eq("id", employee_id).execute()
    return result.data


@router.delete("/employees")
async def delete_employee(store_id: str, employee_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    result = db.table("employees").delete().eq("user_id", user_id).eq("store_id", store_id).eq("id", employee_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Employee not found")
    return result.data
    

