"use client";

import { useState } from "react";
import { PipelineResult } from "@/lib/api";
import { FileText, Mail, ShieldCheck, MessageSquare, Copy, Check } from "lucide-react";

type Tab = "resume" | "cover_letter" | "ats" | "interview";

export default function ResultsDossier({ result }: { result: PipelineResult }) {
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "resume", label: "Tailored Resume", icon: <FileText size={14} /> },
    { key: "cover_letter", label: "Cover Letter", icon: <Mail size={14} /> },
    { key: "ats", label: "ATS Score", icon: <ShieldCheck size={14} /> },
    { key: "interview", label: "Interview Prep", icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="border border-hairline bg-panel rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-hairline px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-green mb-1">
            [ Mission Complete ]
          </div>
          <h3 className="font-display font-semibold text-lg">Results Dossier</h3>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="text-right">
            <div className="text-text-muted uppercase tracking-widest text-[9px]">Match</div>
            <div className="text-amber font-medium">{result.match_score}%</div>
          </div>
          <div className="text-right">
            <div className="text-text-muted uppercase tracking-widest text-[9px]">ATS</div>
            <div className="text-green font-medium">{result.ats_result?.ats_score ?? "—"}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-amber text-amber"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {activeTab === "resume" && (
          <TabContent
            text={result.tailored_resume}
            onCopy={() => handleCopy(result.tailored_resume)}
            copied={copied}
          >
            {result.missing_keywords?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {result.missing_keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] font-mono uppercase tracking-wider border border-amber/30 text-amber bg-amber-dim/40 rounded px-2 py-1"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </TabContent>
        )}

        {activeTab === "cover_letter" && (
          <TabContent
            text={result.cover_letter}
            onCopy={() => handleCopy(result.cover_letter)}
            copied={copied}
          />
        )}

        {activeTab === "ats" && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
                Keyword Match Rate
              </div>
              <p className="text-sm">{result.ats_result?.keyword_match_rate}</p>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
                Structure Feedback
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {result.ats_result?.structure_feedback}
              </p>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-red mb-2">
                Formatting Issues
              </div>
              <ul className="space-y-1.5">
                {result.ats_result?.formatting_issues?.map((issue, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-2">
                    <span className="text-red">·</span> {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-green mb-2">
                Recommended Fixes
              </div>
              <ul className="space-y-1.5">
                {result.ats_result?.recommended_fixes?.map((fix, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-2">
                    <span className="text-green">·</span> {fix}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "interview" && (
          <div className="space-y-8">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber mb-3">
                Technical Questions
              </div>
              <div className="space-y-4">
                {result.interview_prep?.technical_questions?.map((q, i) => (
                  <QAItem key={i} question={q.question} answer={q.answer_outline} />
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber mb-3">
                Behavioral Questions
              </div>
              <div className="space-y-4">
                {result.interview_prep?.behavioral_questions?.map((q, i) => (
                  <QAItem key={i} question={q.question} answer={q.answer_outline} />
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-green mb-3">
                Ask the Interviewer
              </div>
              <ul className="space-y-1.5">
                {result.interview_prep?.questions_to_ask_interviewer?.map((q, i) => (
                  <li key={i} className="text-sm text-text-secondary flex gap-2">
                    <span className="text-green">·</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabContent({
  text,
  onCopy,
  copied,
  children,
}: {
  text: string;
  onCopy: () => void;
  copied: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-amber transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {children}
      <pre className="whitespace-pre-wrap text-sm text-text-secondary leading-relaxed font-body">
        {text}
      </pre>
    </div>
  );
}

function QAItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border border-hairline rounded-lg p-4">
      <p className="text-sm font-medium mb-2">{question}</p>
      <p className="text-xs text-text-secondary leading-relaxed">{answer}</p>
    </div>
  );
}