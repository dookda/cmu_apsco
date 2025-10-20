from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Optional
import uvicorn
from dotenv import load_dotenv
from app.routers import ndvi, survey

# Load environment variables from .env file
load_dotenv()

print("=" * 60)
print("CMU APSCO API Starting...")
print("=" * 60)
print(f"Environment Variables:")
print(f"  GEE_SERVICE_ACCOUNT: {os.getenv('GEE_SERVICE_ACCOUNT')}")
print(f"  GEE_KEY_FILE: {os.getenv('GEE_KEY_FILE')}")
print(f"  Working Directory: {os.getcwd()}")
print("=" * 60)

app = FastAPI(title="CMU APSCO API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ndvi.router)
app.include_router(survey.router)

# Health check endpoint


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "CMU APSCO API is running"}

# Root endpoint


@app.get("/")
async def read_root():
    return {"message": "Welcome to CMU APSCO API"}

# Example API endpoint


@app.get("/api/data")
async def get_data():
    return {"data": "This is sample data from FastAPI"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
