import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface JobListing {
  id: string;
  external_id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  url: string;
  status: string;
  match_score: number | null;
  created_at: string;
}

export interface PipelineResult {
  resume_text: string;
  job_description: string;
  company_name: string;
  role_title: string;
  tone: string;
  match_score: number;
  missing_keywords: string[];
  tailored_resume: string;
  cover_letter: string;
  ats_result: {
    ats_score: number;
    keyword_match_rate: string;
    formatting_issues: string[];
    structure_feedback: string;
    recommended_fixes: string[];
  };
  interview_prep: {
    technical_questions: { question: string; answer_outline: string }[];
    behavioral_questions: { question: string; answer_outline: string }[];
    questions_to_ask_interviewer: string[];
  };
  tracker_result: any;
}

export async function discoverJobs(query: string, location: string = "gb") {
  const res = await api.get(`/agents/discover`, { params: { query, location } });
  return res.data;
}

export async function fetchJobs(status?: string) {
  const res = await api.get(`/jobs`, { params: status ? { status } : {} });
  return res.data;
}

export async function runPipeline(params: {
  job_description: string;
  company_name: string;
  role_title: string;
  tone: string;
  external_id?: string;
}) {
  const res = await api.post(`/pipeline/run`, null, { params });
  return res.data as PipelineResult;
}