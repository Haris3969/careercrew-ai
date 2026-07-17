from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END

from agents.analyzer_agent import analyze_match
from agents.resume_agent import tailor_resume
from agents.cover_letter_agent import generate_cover_letter
from agents.ats_agent import score_ats_compatibility
from agents.interview_agent import generate_interview_prep
from agents.tracker_agent import update_job_status


class PipelineState(TypedDict):
    resume_text: str
    job_description: str
    company_name: str
    role_title: str
    tone: str
    external_id: Optional[str]

    match_score: Optional[float]
    missing_keywords: Optional[list]
    tailored_resume: Optional[str]
    cover_letter: Optional[str]
    ats_result: Optional[dict]
    interview_prep: Optional[dict]
    tracker_result: Optional[dict]


async def analyze_node(state: PipelineState) -> PipelineState:
    result = await analyze_match(state["resume_text"], state["job_description"])
    state["match_score"] = result["match_score"]
    state["missing_keywords"] = result["missing_keywords"]
    return state


async def tailor_node(state: PipelineState) -> PipelineState:
    tailored = await tailor_resume(
        resume_text=state["resume_text"],
        job_description=state["job_description"],
        missing_keywords=state["missing_keywords"],
    )
    state["tailored_resume"] = tailored
    return state


async def cover_letter_node(state: PipelineState) -> PipelineState:
    letter = await generate_cover_letter(
        resume_text=state["resume_text"],
        job_description=state["job_description"],
        company_name=state["company_name"],
        role_title=state["role_title"],
        tone=state["tone"],
    )
    state["cover_letter"] = letter
    return state


async def ats_node(state: PipelineState) -> PipelineState:
    result = await score_ats_compatibility(state["tailored_resume"], state["job_description"])
    state["ats_result"] = result
    return state


async def interview_prep_node(state: PipelineState) -> PipelineState:
    result = await generate_interview_prep(state["resume_text"], state["job_description"])
    state["interview_prep"] = result
    return state


async def tracker_node(state: PipelineState) -> PipelineState:
    if state.get("external_id"):
        result = await update_job_status(
            external_id=state["external_id"],
            new_status="tailored",
            match_score=state["match_score"],
        )
        state["tracker_result"] = result
    return state


def build_pipeline_graph():
    graph = StateGraph(PipelineState)

    graph.add_node("analyze", analyze_node)
    graph.add_node("tailor", tailor_node)
    graph.add_node("cover_letter", cover_letter_node)
    graph.add_node("ats_score", ats_node)
    graph.add_node("interview_prep", interview_prep_node)
    graph.add_node("tracker", tracker_node)

    graph.set_entry_point("analyze")
    graph.add_edge("analyze", "tailor")
    graph.add_edge("tailor", "cover_letter")
    graph.add_edge("cover_letter", "ats_score")
    graph.add_edge("ats_score", "interview_prep")
    graph.add_edge("interview_prep", "tracker")
    graph.add_edge("tracker", END)

    return graph.compile()


pipeline = build_pipeline_graph()