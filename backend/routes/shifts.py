from fastapi import APIRouter, HTTPException, Header
from database import supabase, get_supabase_client
from models import ShiftCreate, ShiftUpdate

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
    

@router.post("/shifts")
async def add_shift(shift: ShiftCreate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    data = shift.model_dump(mode='json')
    data["user_id"] = user_id
    result = db.table("shifts").insert(data).execute()
    return result.data[0]


@router.get("/shifts")
async def get_shifts(store_id: str, employee_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    result = db.table("shifts").select("*").eq("user_id", user_id).eq("store_id", store_id).eq("employee_id", employee_id).execute()
    return result.data


@router.patch("/shifts")
async def update_shift(shift: ShiftUpdate, shift_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    data = shift.model_dump(mode='json', exclude_none=True)
    result = db.table("shifts").update(data).eq("user_id", user_id).eq("id", shift_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Failed to update")
    return result.data


@router.delete("/shifts")
async def delete_shift(shift_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    db = get_supabase_client()
    result = db.table("shifts").delete().eq("user_id", user_id).eq("id", shift_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Failed to delete")
    return result.data


