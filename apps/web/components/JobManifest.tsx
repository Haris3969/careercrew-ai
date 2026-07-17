"use client";

import { useState, useEffect } from "react";
import { fetchJobs, discoverJobs, JobListing } from "@/lib/api";
import { Search, Loader2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  discovered: "text-text-secondary border-hairline",
  analyzed: "text-amber border-amber-dim",
  tailored: "text-amber border-amber-dim",
  applied: "text-green border-green-dim",
  interviewing: "text-green border-green-dim",
  offer: "text-green border-green-dim",
  rejected: "text-red border-red/30",
};

export default function JobManifest({
  onSelectJob,
  selectedJobId,
}: {
  onSelectJob: (job: JobListing) => void;
  selectedJobId?: string;
}) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [query, setQuery] = useState("data scientist");
  const [location, setLocation] = useState("gb");

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      await discoverJobs(query, location);
      await loadJobs();
    } catch (err) {
      console.error("Discovery failed", err);
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="border border-hairline bg-panel rounded-lg overflow-hidden">
      {/* Search bar */}
      <div className="border-b border-hairline p-4 flex items-center gap-3">
        <Search size={16} className="text-text-muted shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. data scientist"
          className="bg-transparent text-sm outline-none flex-1 placeholder:text-text-muted"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="gb"
          className="bg-panel-raised border border-hairline rounded px-2 py-1 text-xs font-mono w-16 text-center outline-none"
        />
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="bg-amber-dim text-amber border border-amber/30 rounded px-4 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-amber/20 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {discovering && <Loader2 size={12} className="animate-spin" />}
          {discovering ? "Scanning" : "Run Discovery"}
        </button>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[100px_1fr_180px_100px_90px] gap-4 px-4 py-2 border-b border-hairline text-[10px] uppercase tracking-widest text-text-muted font-mono">
        <span>Status</span>
        <span>Role / Company</span>
        <span>Location</span>
        <span>Match</span>
        <span>ID</span>
      </div>

      {/* Job rows */}
      <div className="max-h-[440px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-text-muted font-mono text-xs">
            [ LOADING MANIFEST ]
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-text-muted font-mono text-xs">
            [ NO JOBS DISCOVERED — RUN DISCOVERY TO BEGIN ]
          </div>
        ) : (
          jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => onSelectJob(job)}
              className={`w-full text-left grid grid-cols-[100px_1fr_180px_100px_90px] gap-4 px-4 py-3 border-b border-hairline last:border-b-0 hover:bg-panel-raised transition-colors ${
                selectedJobId === job.id ? "bg-panel-raised" : ""
              }`}
            >
              <span
                className={`text-[10px] font-mono uppercase tracking-wider border rounded px-1.5 py-0.5 w-fit ${
                  STATUS_STYLES[job.status] || "text-text-secondary border-hairline"
                }`}
              >
                {job.status}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{job.title}</div>
                <div className="text-xs text-text-secondary truncate">{job.company}</div>
              </div>
              <span className="text-xs text-text-secondary truncate self-center">
                {job.location}
              </span>
              <span className="text-xs font-mono self-center">
                {job.match_score ? `${job.match_score}%` : "—"}
              </span>
              <span className="text-[10px] font-mono text-text-muted self-center truncate">
                {job.external_id}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}