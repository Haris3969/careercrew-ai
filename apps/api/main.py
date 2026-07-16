from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from agents.discovery_agent import discover_jobs

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

@app.get("/agents/discover")
async def run_discovery(query: str = "data scientist", location: str = "pk"):
    jobs = await discover_jobs(query=query, location=location)
    return {"count": len(jobs), "jobs": jobs}