import numpy as np
from core.llm import get_embedding, generate_text


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


async def analyze_match(resume_text: str, job_description: str) -> dict:
    """
    Computes a semantic match score between a resume and a job description,
    and asks the LLM to extract missing keywords/skills.
    """
    resume_embedding = get_embedding(resume_text)
    jd_embedding = get_embedding(job_description)

    match_score = cosine_similarity(resume_embedding, jd_embedding)

    prompt = f"""You are a technical recruiter analyzing a resume against a job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

List the top 5 skills or keywords mentioned in the job description that are MISSING or WEAK in the resume.
Respond as a simple comma-separated list, nothing else.
"""
    result_text = generate_text(prompt)
    missing_keywords = [kw.strip() for kw in result_text.split(",")]

    return {
        "match_score": round(match_score * 100, 2),
        "missing_keywords": missing_keywords,
    }