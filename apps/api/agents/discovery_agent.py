import httpx
from core.config import get_settings
from core.vectorstore import get_supabase_client

settings = get_settings()


async def discover_jobs(query: str, location: str = "pk", results_limit: int = 10) -> list[dict]:
    """
    Calls the Adzuna API to find job listings matching the query,
    stores new ones in Supabase, and returns the normalized list.
    """
    url = f"https://api.adzuna.com/v1/api/jobs/{location}/search/1"
    params = {
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_app_key,
        "results_per_page": results_limit,
        "what": query,
        "content-type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=15.0)
        response.raise_for_status()
        data = response.json()

    raw_jobs = data.get("results", [])
    normalized_jobs = []

    for job in raw_jobs:
        normalized_jobs.append({
            "external_id": str(job.get("id")),
            "title": job.get("title", "").strip(),
            "company": (job.get("company") or {}).get("display_name", "Unknown"),
            "location": (job.get("location") or {}).get("display_name", ""),
            "description": job.get("description", ""),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "url": job.get("redirect_url", ""),
            "source": "adzuna",
            "status": "discovered",
        })

    if normalized_jobs:
        supabase = get_supabase_client()
        for job in normalized_jobs:
            supabase.table("job_listings").upsert(
                job, on_conflict="external_id"
            ).execute()

    return normalized_jobs