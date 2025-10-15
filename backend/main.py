from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload

app = FastAPI(title="SnapX API", version="1.0.0")

# CORS - allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(upload.router, prefix="/api", tags=["upload"])

@app.get("/")
def read_root():
    return {"message": "Backend is running"}