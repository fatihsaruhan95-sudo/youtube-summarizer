"use client";

import { useState } from "react";
import { Youtube } from "lucide-react";
import UrlForm from "@/components/UrlForm";
import LoadingState from "@/components/LoadingState";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import SummaryDisplay from "@/components/SummaryDisplay";
import ErrorMessage from "@/components/ErrorMessage";
import {
  TranscriptApiResponse,
  SummarizeApiResponse,
  TranscriptResponse,
  SummarizeResponse,
  ErrorResponse,
} from "@/types";

type PageState =
  | { phase: "idle" }
  | { phase: "fetching-transcript" }
  | { phase: "transcript-ready"; data: TranscriptResponse }
  | { phase: "summarizing"; data: TranscriptResponse }
  | { phase: "success"; data: SummarizeResponse }
  | { phase: "error"; error: ErrorResponse };

export default function Home() {
  const [state, setState] = useState<PageState>({ phase: "idle" });

  const handleFetchTranscript = async (url: string) => {
    setState({ phase: "fetching-transcript" });
    try {
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: TranscriptApiResponse = await res.json();
      if (data.success) {
        setState({ phase: "transcript-ready", data });
      } else {
        setState({ phase: "error", error: data });
      }
    } catch {
      setState({
        phase: "error",
        error: { success: false, error: "Network error. Please check your connection.", code: "UNKNOWN" },
      });
    }
  };

  const handleSummarize = async (transcript: string, videoId: string) => {
    if (state.phase !== "transcript-ready") return;
    setState({ phase: "summarizing", data: state.data });
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, videoId }),
      });
      const data: SummarizeApiResponse = await res.json();
      if (data.success) {
        setState({ phase: "success", data });
      } else {
        setState({ phase: "error", error: data });
      }
    } catch {
      setState({
        phase: "error",
        error: { success: false, error: "Network error. Please check your connection.", code: "UNKNOWN" },
      });
    }
  };

  const handleReset = () => setState({ phase: "idle" });

  const isLoading =
    state.phase === "fetching-transcript" || state.phase === "summarizing";

  const loadingLabel =
    state.phase === "fetching-transcript"
      ? "Fetching transcript"
      : "Generating summary";

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-medium">
            <Youtube size={16} />
            YouTube Summarizer
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Paste a URL,<br />
            <span className="text-red-500">get a summary.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
            AI-powered summaries of any YouTube video — in seconds.
          </p>
        </div>

        {/* Form — always visible unless showing final summary */}
        {state.phase !== "success" && (
          <UrlForm onSubmit={handleFetchTranscript} isLoading={isLoading} />
        )}

        {/* Step indicators */}
        {(state.phase === "transcript-ready" || state.phase === "summarizing" || state.phase === "success") && (
          <div className="flex items-center gap-2 text-sm">
            <Step number={1} label="Transcript" done />
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <Step number={2} label="Summary" done={state.phase === "success"} active={state.phase === "summarizing"} />
          </div>
        )}

        {/* Loading */}
        {isLoading && <LoadingState label={loadingLabel} />}

        {/* Transcript ready */}
        {state.phase === "transcript-ready" && (
          <TranscriptDisplay
            data={state.data}
            onSummarize={handleSummarize}
            isSummarizing={false}
          />
        )}

        {/* Summarizing — show transcript with loading button */}
        {state.phase === "summarizing" && (
          <TranscriptDisplay
            data={state.data}
            onSummarize={handleSummarize}
            isSummarizing={true}
          />
        )}

        {/* Summary */}
        {state.phase === "success" && (
          <SummaryDisplay data={state.data} onReset={handleReset} />
        )}

        {/* Error */}
        {state.phase === "error" && (
          <ErrorMessage error={state.error} onRetry={handleReset} />
        )}

        {state.phase === "idle" && (
          <p className="text-center text-sm text-gray-400">
            Works with any YouTube video that has captions enabled.
          </p>
        )}
      </div>
    </main>
  );
}

function Step({
  number,
  label,
  done,
  active,
}: {
  number: number;
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done
            ? "bg-red-500 text-white"
            : active
            ? "bg-red-100 text-red-500 border border-red-300"
            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
        }`}
      >
        {number}
      </div>
      <span className={`text-sm font-medium ${done || active ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}
