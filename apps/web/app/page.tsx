"use client";

import { useState } from "react";
import JobManifest from "@/components/JobManifest";
import FlightPlan from "@/components/FlightPlan";
import ResumeUpload from "@/components/ResumeUpload";
import ResultsDossier from "@/components/ResultsDossier";
import { JobListing, PipelineResult } from "@/lib/api";

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);

  const handleSelectJob = (job: JobListing) => {
    setSelectedJob(job);
    setPipelineResult(null);
  };

  const handleResumeReady = (text: string, filename: string) => {
    setResumeText(text || null);
    setResumeFilename(filename || null);
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-hairline bg-panel">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display font-bold text-2xl tracking-tight">
              CAREERCREW<span className="text-amber">.AI</span>
            </h1>
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Mission Control
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 pt-8">
        <div className="border border-hairline bg-panel rounded-lg p-6 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">
            Step 1 — Upload Your Resume
          </div>
          <ResumeUpload
            onResumeReady={handleResumeReady}
            resumeText={resumeText}
            filename={resumeFilename}
          />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pb-8 grid grid-cols-[1fr_420px] gap-6">
        <JobManifest onSelectJob={handleSelectJob} selectedJobId={selectedJob?.id} />

        <div className="border border-hairline bg-panel rounded-lg p-6">
          {!resumeText ? (
            <p className="text-text-muted font-mono text-xs text-center py-12">
              [ UPLOAD RESUME TO BEGIN ]
            </p>
          ) : !selectedJob ? (
            <p className="text-text-muted font-mono text-xs text-center py-12">
              [ SELECT A JOB FROM THE MANIFEST ]
            </p>
          ) : (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
                Selected Target
              </div>
              <h2 className="font-display font-semibold text-lg mb-1">
                {selectedJob.title}
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                {selectedJob.company} — {selectedJob.location}
              </p>

              <FlightPlan
                job={selectedJob}
                resumeText={resumeText}
                onComplete={setPipelineResult}
              />
            </div>
          )}
        </div>
      </div>

      {pipelineResult && (
        <div className="max-w-[1400px] mx-auto px-8 pb-8">
          <ResultsDossier result={pipelineResult} />
        </div>
      )}
    </main>
  );
}