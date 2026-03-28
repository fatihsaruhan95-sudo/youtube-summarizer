"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, Loader2, ExternalLink } from "lucide-react";
import { TranscriptResponse } from "@/types";
import { buildVideoUrl } from "@/lib/youtube-utils";

interface TranscriptDisplayProps {
  data: TranscriptResponse;
  onSummarize: (transcript: string, videoId: string) => void;
  isSummarizing: boolean;
}

export default function TranscriptDisplay({
  data,
  onSummarize,
  isSummarizing,
}: TranscriptDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const { transcript, videoId, segmentCount } = data;
  const preview = transcript.slice(0, 400);

  return (
    <div className="w-full space-y-3">
      {/* Transcript card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-green-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Transcript Ready
            </h2>
          </div>
          <a
            href={buildVideoUrl(videoId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition"
          >
            <ExternalLink size={13} />
            YouTube
          </a>
        </div>

        <div className="text-xs text-gray-400 mb-3">
          {segmentCount} segments &middot; {(transcript.length / 1000).toFixed(1)}k characters
        </div>

        {/* Transcript text */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>{expanded ? transcript : preview + (transcript.length > 400 ? "..." : "")}</p>
        </div>

        {transcript.length > 400 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            {expanded ? (
              <><ChevronUp size={14} /> Show less</>
            ) : (
              <><ChevronDown size={14} /> Show full transcript</>
            )}
          </button>
        )}
      </div>

      {/* Summarize button */}
      <button
        onClick={() => onSummarize(transcript, videoId)}
        disabled={isSummarizing}
        className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-60 transition flex items-center justify-center gap-2 text-base"
      >
        {isSummarizing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating summary...
          </>
        ) : (
          "Summarize with AI"
        )}
      </button>
    </div>
  );
}
