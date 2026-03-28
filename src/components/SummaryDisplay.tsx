"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Check, ExternalLink, Tag } from "lucide-react";
import { SummarizeResponse } from "@/types";
import { buildVideoUrl } from "@/lib/youtube-utils";

interface SummaryDisplayProps {
  data: SummarizeResponse;
  onReset: () => void;
}

export default function SummaryDisplay({ data, onReset }: SummaryDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { summary, videoId, transcriptLength } = data;

  const copyAsMarkdown = () => {
    const md = [
      `## Summary`,
      ``,
      `**TL;DR:** ${summary.tldr}`,
      ``,
      `### Key Points`,
      ...summary.keyPoints.map((p) => `- ${p}`),
      ``,
      `### Topics`,
      summary.topics.join(", "),
    ].join("\n");

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <a
          href={buildVideoUrl(videoId)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition"
        >
          <ExternalLink size={14} />
          Open on YouTube
        </a>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAsMarkdown}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-400"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            New Video
          </button>
        </div>
      </div>

      {/* TL;DR */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          TL;DR
        </h2>
        <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed">
          {summary.tldr}
        </p>
      </div>

      {/* Key Points */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Key Points
        </h2>
        <ul className="space-y-3">
          {summary.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-3 items-start">
              <CheckCircle2
                size={18}
                className="text-red-500 mt-0.5 shrink-0"
              />
              <span className="text-gray-700 dark:text-gray-300 leading-snug">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Topics */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <Tag size={12} />
          Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {summary.topics.map((topic, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Footer meta */}
      <p className="text-xs text-center text-gray-400">
        Transcript length: {(transcriptLength / 1000).toFixed(1)}k chars &middot; Powered by Claude AI
      </p>
    </div>
  );
}
