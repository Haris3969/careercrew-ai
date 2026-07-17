from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from agents.discovery_agent import discover_jobs
from agents.analyzer_agent import analyze_match
from agents.resume_agent import tailor_resume

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

@app.post("/agents/analyze")
async def run_analysis(job_description: str):
    with open("data/sample_resume.txt", "r", encoding="utf-8") as f:
        resume_text = f.read()

    result = await analyze_match(resume_text, job_description)
    return result

@app.post("/agents/tailor")
async def run_tailor(job_description: str):
    with open("data/sample_resume.txt", "r", encoding="utf-8") as f:
        resume_text = f.read()

    analysis = await analyze_match(resume_text, job_description)
    tailored_resume = await tailor_resume(
        resume_text=resume_text,
        job_description=job_description,
        missing_keywords=analysis["missing_keywords"],
    )

    return {
        "match_score": analysis["match_score"],
        "missing_keywords": analysis["missing_keywords"],
        "tailored_resume": tailored_resume,
    }