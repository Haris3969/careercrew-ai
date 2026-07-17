"use client";

import { useState } from "react";
import JobManifest from "@/components/JobManifest";
import FlightPlan from "@/components/FlightPlan";
import { JobListing, PipelineResult } from "@/lib/api";
import ResultsDossier from "@/components/ResultsDossier";

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);

  const handleSelectJob = (job: JobListing) => {
    setSelectedJob(job);
    setPipelineResult(null);
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

      <div className="max-w-[1400px] mx-auto px-8 py-8 grid grid-cols-[1fr_420px] gap-6">
        <JobManifest onSelectJob={handleSelectJob} selectedJobId={selectedJob?.id} />

        <div className="border border-hairline bg-panel rounded-lg p-6">
          {selectedJob ? (
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

              <FlightPlan job={selectedJob} onComplete={setPipelineResult} />
            </div>
          ) : (
            <p className="text-text-muted font-mono text-xs text-center py-12">
              [ SELECT A JOB FROM THE MANIFEST ]
            </p>
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