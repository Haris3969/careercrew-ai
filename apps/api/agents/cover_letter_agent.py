from core.llm import generate_text

VALID_TONES = {
    "formal": "formal, traditional, and highly professional",
    "conversational": "warm, conversational, and personable while still professional",
    "confident": "confident, direct, and achievement-focused",
    "enthusiastic": "enthusiastic, energetic, and genuinely excited about the role",
}


async def generate_cover_letter(
    resume_text: str,
    job_description: str,
    company_name: str = "the company",
    role_title: str = "the position",
    tone: str = "formal",
) -> str:
    """
    Generates a personalized cover letter grounded strictly in the candidate's
    real resume content, in the requested tone.
    """
    tone_key = tone.lower().strip()
    tone_description = VALID_TONES.get(tone_key, VALID_TONES["formal"])

    prompt = f"""You are an expert cover letter writer helping a candidate apply for a job.

STRICT RULES:
- NEVER invent skills, experience, companies, or achievements not present in the candidate's resume.
- Ground every claim in the resume content provided below.
- Reference the specific job description to explain genuine fit — connect real resume experience to real job requirements.
- Write in a {tone_description} tone.
- Structure: opening hook, 2 body paragraphs connecting real experience to the role, closing paragraph with a call to action.
- Address it to "{company_name}" for the "{role_title}" role.
- Keep it under 350 words.
- Do not use generic filler phrases like "I am writing to express my interest" — make the opening specific and engaging.

CANDIDATE RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Output ONLY the full cover letter text. No preamble, no explanation, no notes.
"""
    letter = generate_text(prompt)
    return letter.strip()