from core.llm import generate_text
import json


async def score_ats_compatibility(resume_text: str, job_description: str) -> dict:
    """
    Simulates how an ATS (Applicant Tracking System) would parse and score
    a resume against a job description. Returns a structured score + issues.
    """
    prompt = f"""You are an ATS (Applicant Tracking System) simulator used by recruiters.

Analyze the resume below as if you were parsing it through a real ATS like Workday, Greenhouse, or Taleo.

Evaluate:
1. Keyword match rate against the job description (be specific about which important keywords are present vs missing)
2. Formatting red flags that could break ATS parsing (e.g. tables, columns, graphics, unusual headers, non-standard section names)
3. Section structure (does it have clear Experience, Skills, Education sections an ATS can detect?)
4. Overall ATS compatibility score from 0-100

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Respond ONLY with valid JSON in exactly this structure, no markdown formatting, no code fences, no explanation:
{{
  "ats_score": <number 0-100>,
  "keyword_match_rate": "<e.g. 7/10 key terms found>",
  "formatting_issues": ["issue1", "issue2"],
  "structure_feedback": "<short paragraph>",
  "recommended_fixes": ["fix1", "fix2", "fix3"]
}}
"""
    response_text = generate_text(prompt)

    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        result = {
            "ats_score": None,
            "error": "Could not parse structured output",
            "raw_response": response_text,
        }

    return result