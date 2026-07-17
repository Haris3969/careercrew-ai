from core.llm import generate_text


async def tailor_resume(resume_text: str, job_description: str, missing_keywords: list[str]) -> str:
    """
    Rewrites the resume to better match the job description, naturally
    incorporating relevant missing keywords WITHOUT fabricating experience.
    """
    keywords_str = ", ".join(missing_keywords)

    prompt = f"""You are an expert resume writer helping a candidate tailor their resume for a specific job.

STRICT RULES:
- NEVER invent skills, tools, companies, degrees, or experience the candidate does not have.
- You may rephrase, reorder, emphasize, or reword existing bullets to better align with the job description.
- If a missing keyword genuinely relates to something the candidate already has experience with (e.g. they used a similar tool), you may naturally mention the connection.
- If a missing keyword has NO real basis in the candidate's actual background, DO NOT add it. Instead, leave it out entirely.
- Keep the resume format clean: sections like Skills, Experience, Projects, Education.
- Keep it concise and professional, similar length to the original.

ORIGINAL RESUME:
{resume_text}

TARGET JOB DESCRIPTION:
{job_description}

KEYWORDS THE JOB CARES ABOUT (only include if genuinely applicable, do not fabricate):
{keywords_str}

Now output the FULL tailored resume text, ready to use. Do not include any explanation, preamble, or notes — output only the resume content itself.
"""
    tailored_text = generate_text(prompt)
    return tailored_text.strip()