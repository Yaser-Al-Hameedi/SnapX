from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY, STORAGE_BUCKET


print(f"Connecting to: {SUPABASE_URL}")
print(f"Service key loaded: {'Yes' if SUPABASE_SERVICE_KEY else 'No'}")

# Initialize Supabase client with service role key (for backend operations)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def get_supabase_client() -> Client:
    """Returns the Supabase client instance"""
    return supabase

def upload_file_to_storage(file_path: str, file_data: bytes, content_type: str) -> str:
    """
    Upload file to Supabase storage
    Returns the public URL of the uploaded file
    """
    try:
        # Upload to storage bucket
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=file_path,
            file=file_data,
            file_options={"content-type": content_type}
        )
        
        # Get public URL
        
        public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(file_path)
        return public_url
    except Exception as e:
        raise Exception(f"Failed to upload file to storage: {str(e)}")