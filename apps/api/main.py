from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="CareerCrew AI",
    description="Multi-agent job application pipeline",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "CareerCrew AI API is running"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment,
    }