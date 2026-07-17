from core.llm import generate_text
import json


async def generate_interview_prep(resume_text: str, job_description: str) -> dict:
    """
    Generates likely interview questions based on the job description and
    the candidate's resume, along with suggested STAR-method answer outlines
    grounded in the candidate's real experience.
    """
    prompt = f"""You are an experienced technical interviewer and career coach preparing
a candidate for an interview.

Based on the job description and the candidate's real resume below, generate:
1. 3 technical/role-specific questions likely to be asked for this position
2. 2 behavioral questions likely to be asked
3. For EACH question, a brief answer outline using the STAR method (Situation, Task, Action, Result),
   grounded ONLY in the candidate's actual resume experience — do not invent projects or outcomes.
4. 2 smart questions the candidate should ask the interviewer, relevant to this specific role/company context

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Respond ONLY with valid JSON in exactly this structure, no markdown formatting, no code fences:
{{
  "technical_questions": [
    {{"question": "...", "answer_outline": "..."}},
    {{"question": "...", "answer_outline": "..."}},
    {{"question": "...", "answer_outline": "..."}}
  ],
  "behavioral_questions": [
    {{"question": "...", "answer_outline": "..."}},
    {{"question": "...", "answer_outline": "..."}}
  ],
  "questions_to_ask_interviewer": ["...", "..."]
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
            "error": "Could not parse structured output",
            "raw_response": response_text,
        }

    return result