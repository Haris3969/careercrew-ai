"use client";

import { useState } from "react";
import { runPipeline, JobListing, PipelineResult } from "@/lib/api";
import { Rocket, Loader2, CheckCircle2 } from "lucide-react";

const STAGES = [
  { key: "analyze", label: "Analyze" },
  { key: "tailor", label: "Tailor Resume" },
  { key: "cover_letter", label: "Cover Letter" },
  { key: "ats_score", label: "ATS Score" },
  { key: "interview_prep", label: "Interview Prep" },
  { key: "tracker", label: "Track" },
];

export default function FlightPlan({
  job,
  onComplete,
}: {
  job: JobListing;
  onComplete: (result: PipelineResult) => void;
}) {
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [companyName, setCompanyName] = useState(job.company);
  const [roleTitle, setRoleTitle] = useState(job.title);
  const [tone, setTone] = useState("formal");

  const handleRun = async () => {
    setRunning(true);
    setCompletedStages([]);
    setActiveStage(0);

    // Simulate stage progression visually while the actual request runs
    // (the backend runs all stages in one call, so we animate stages
    // progressively to reflect real elapsed time, then finalize on response)
    const stageInterval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < STAGES.length - 1) {
          setCompletedStages((completed) => [...completed, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 3500);

    try {
      const result = await runPipeline({
        job_description: job.description,
        company_name: companyName,
        role_title: roleTitle,
        tone,
        external_id: job.external_id.trim(),
      });

      clearInterval(stageInterval);
      setCompletedStages([0, 1, 2, 3, 4, 5]);
      setActiveStage(6);
      onComplete(result);
    } catch (err) {
      clearInterval(stageInterval);
      console.error("Pipeline failed", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      {!running && completedStages.length === 0 && (
        <div className="space-y-3 mb-6">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">
              Company
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-panel-raised border border-hairline rounded px-3 py-2 text-sm outline-none focus:border-amber/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">
              Role Title
            </label>
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full bg-panel-raised border border-hairline rounded px-3 py-2 text-sm outline-none focus:border-amber/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">
              Cover Letter Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-panel-raised border border-hairline rounded px-3 py-2 text-sm outline-none focus:border-amber/50"
            >
              <option value="formal">Formal</option>
              <option value="conversational">Conversational</option>
              <option value="confident">Confident</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>
        </div>
      )}

      {/* Flight Plan trajectory */}
      <div className="relative py-6">
        <div className="absolute top-[38px] left-0 right-0 h-px bg-hairline" />
        <div className="relative flex justify-between">
          {STAGES.map((stage, i) => {
            const isComplete = completedStages.includes(i);
            const isActive = activeStage === i && running;
            return (
              <div key={stage.key} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center
                    ${
                      isComplete
                        ? "bg-green border-green"
                        : isActive
                        ? "bg-amber border-amber animate-pulse"
                        : "bg-panel border-hairline"
                    }`}
                >
                  {isComplete && <CheckCircle2 size={10} className="text-panel" />}
                </div>
                <span
                  className={`text-[9px] font-mono uppercase tracking-wider text-center leading-tight ${
                    isComplete
                      ? "text-green"
                      : isActive
                      ? "text-amber"
                      : "text-text-muted"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {running && (
        <div className="text-center font-mono text-xs text-amber mb-4 animate-pulse">
          [ EXECUTING: {STAGES[Math.min(activeStage, 5)]?.label.toUpperCase()} ]
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={running}
        className="w-full bg-amber-dim text-amber border border-amber/30 rounded-lg py-3 text-sm font-mono uppercase tracking-wider hover:bg-amber/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Mission in Progress
          </>
        ) : (
          <>
            <Rocket size={16} />
            Launch Pipeline
          </>
        )}
      </button>
    </div>
  );
}