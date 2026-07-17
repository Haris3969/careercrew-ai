from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from agents.discovery_agent import discover_jobs
from agents.analyzer_agent import analyze_match
from agents.resume_agent import tailor_resume
from agents.cover_letter_agent import generate_cover_letter
from agents.ats_agent import score_ats_compatibility
from agents.interview_agent import generate_interview_prep
from agents.tracker_agent import update_job_status, get_jobs_by_status
from agents.supervisor_graph import pipeline


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

@app.post("/agents/cover-letter")
async def run_cover_letter(
    job_description: str,
    company_name: str = "the company",
    role_title: str = "the position",
    tone: str = "formal",
):
    with open("data/sample_resume.txt", "r", encoding="utf-8") as f:
        resume_text = f.read()

    letter = await generate_cover_letter(
        resume_text=resume_text,
        job_description=job_description,
        company_name=company_name,
        role_title=role_title,
        tone=tone,
    )

    return {
        "tone_used": tone,
        "cover_letter": letter,
    }

@app.post("/agents/ats-score")
async def run_ats_score(job_description: str):
    with open("data/sample_resume.txt", "r", encoding="utf-8") as f:
        resume_text = f.read()

    result = await score_ats_compatibility(resume_text, job_description)
    return result

@app.post("/agents/interview-prep")
async def run_interview_prep(job_description: str):
    with open("data/sample_resume.txt", "r", encoding="utf-8") as f:
        resume_text = f.read()

    result = await generate_interview_prep(resume_text, job_description)
    return result

@app.patch("/jobs/{external_id}/status")
async def set_job_status(external_id: str, new_status: str, match_score: float | None = None):
    result = await update_job_status(external_id, new_status, match_score)
    return result


@app.get("/jobs")
async def list_jobs(status: str | None = None):
    jobs = await get_jobs_by_status(status)
    return {"count": len(jobs), "jobs": jobs}

@app.post("/pipeline/run")
async def run_full_pipeline(
    job_description: str,
    company_name: str = "the company",
    role_title: str = "the position",
    tone: str = "formal",
    external_id: str | None = None,
):
    with open("data/sample_resume.txt", "r", encoding="utf-8") as f:
        resume_text = f.read()

    initial_state = {
        "resume_text": resume_text,
        "job_description": job_description,
        "company_name": company_name,
        "role_title": role_title,
        "tone": tone,
        "external_id": external_id,
        "match_score": None,
        "missing_keywords": None,
        "tailored_resume": None,
        "cover_letter": None,
        "ats_result": None,
        "interview_prep": None,
        "tracker_result": None,
    }

    final_state = await pipeline.ainvoke(initial_state)
    return final_state

