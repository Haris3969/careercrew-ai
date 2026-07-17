from core.vectorstore import get_supabase_client

VALID_STATUSES = {
    "discovered",
    "analyzed",
    "tailored",
    "applied",
    "interviewing",
    "offer",
    "rejected",
}


async def update_job_status(external_id: str, new_status: str, match_score: float | None = None) -> dict:
    """
    Updates the pipeline status of a job listing in Supabase.
    """
    if new_status not in VALID_STATUSES:
        return {"error": f"Invalid status '{new_status}'. Must be one of: {', '.join(VALID_STATUSES)}"}

    supabase = get_supabase_client()

    update_data = {"status": new_status}
    if match_score is not None:
        update_data["match_score"] = match_score

    response = (
        supabase.table("job_listings")
        .update(update_data)
        .eq("external_id", external_id)
        .execute()
    )

    if not response.data:
        return {"error": f"No job found with external_id '{external_id}'"}

    return {"updated": True, "job": response.data[0]}


async def get_jobs_by_status(status: str | None = None) -> list[dict]:
    """
    Retrieves job listings, optionally filtered by pipeline status.
    """
    supabase = get_supabase_client()
    query = supabase.table("job_listings").select("*").order("created_at", desc=True)

    if status:
        query = query.eq("status", status)

    response = query.execute()
    return response.data