"use client";

import { useState, useRef } from "react";
import { uploadResume } from "@/lib/api";
import { Upload, FileCheck, Loader2, X } from "lucide-react";

export default function ResumeUpload({
  onResumeReady,
  resumeText,
  filename,
}: {
  onResumeReady: (text: string, filename: string) => void;
  resumeText: string | null;
  filename: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const result = await uploadResume(file);
      if (result.error) {
        setError(result.error);
      } else if (result.resume_text) {
        onResumeReady(result.resume_text, result.filename || file.name);
      }
    } catch (err) {
      setError("Failed to upload resume. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleClear = () => {
    onResumeReady("", "");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (resumeText && filename) {
    return (
      <div className="flex items-center justify-between border border-green/30 bg-green-dim/30 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileCheck size={16} className="text-green shrink-0" />
          <span className="text-sm text-green truncate">{filename}</span>
        </div>
        <button
          onClick={handleClear}
          className="text-text-muted hover:text-red transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-hairline rounded-lg p-6 text-center cursor-pointer hover:border-amber/40 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <Loader2 size={20} className="animate-spin text-amber" />
            <span className="text-xs font-mono">PARSING RESUME</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <Upload size={20} />
            <span className="text-xs font-mono uppercase tracking-wider">
              Drop resume here or click to upload
            </span>
            <span className="text-[10px] text-text-muted">PDF or DOCX</span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red mt-2 font-mono">{error}</p>
      )}
    </div>
  );
}