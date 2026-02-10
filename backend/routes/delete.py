from fastapi import APIRouter, HTTPException
from database import get_supabase_client, delete_file_from_storage

router = APIRouter()

@router.delete("/delete")
async def delete_file(uuid, file_path):
    supabase_client = get_supabase_client()
    file_path = file_path.split("/documents/")[1]

    try:
        delete_file_from_storage(file_path)
        supabase_client.table("documents").delete().eq("uuid", uuid).execute()
        return {"message": "Deleted"}
    except Exception:
        raise HTTPException(status_code=401, detail = "Unable to delete file")
