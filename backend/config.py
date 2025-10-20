import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# OpenAI Configuration
AI_API_KEY= os.getenv("AI_API_KEY", "").strip()

# Storage Configuration
STORAGE_BUCKET = "documents"

# Validate required environment variables
required_vars = ["SUPABASE_URL", "SUPABASE_KEY", "AI_API_KEY"]
missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

print(f"SUPABASE_URL loaded: {SUPABASE_URL}")
print(f"SUPABASE_KEY loaded: {'Yes' if SUPABASE_KEY else 'No'}")