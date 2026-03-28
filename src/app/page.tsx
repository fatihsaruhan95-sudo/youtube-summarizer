"use client";

import { useState } from "react";
import { Youtube } from "lucide-react";
import UrlForm from "@/components/UrlForm";
import LoadingState from "@/components/LoadingState";
import SummaryDisplay from "@/components/SummaryDisplay";
import ErrorMessage from "@/components/ErrorMessage";
import { ApiResponse, SummarizeResponse, ErrorResponse } from "@/types";

type PageState =
  | { phase: "idle" }
  | { phase: "loading"; url: string }
  | { phase: "success"; data: SummarizeResponse }
  | { phase: "error"; error: ErrorResponse };

export default function Home() {
  const [state, setState] = useState<PageState>({ phase: "idle" });

  const handleSubmit = async (url: string) => {
    setState({ phase: "loading", url });

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        setState({ phase: "success", data });
      } else {
        setState({ phase: "error", error: data });
      }
    } catch {
      setState({
        phase: "error",
        error: {
          success: false,
          error: "Network error. Please check your connection and try again.",
          code: "UNKNOWN",
        },
      });
    }
  };

  const handleRetry = () => {
    if (state.phase === "loading") {
      handleSubmit(state.url);
    } else {
      setState({ phase: "idle" });
    }
  };

  const handleReset = () => setState({ phase: "idle" });

  const isLoading = state.phase === "loading";

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

        {/* Form */}
        <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* States */}
        {state.phase === "loading" && <LoadingState />}

        {state.phase === "success" && (
          <SummaryDisplay data={state.data} onReset={handleReset} />
        )}

        {state.phase === "error" && (
          <ErrorMessage error={state.error} onRetry={handleRetry} />
        )}

        {/* Idle hint */}
        {state.phase === "idle" && (
          <p className="text-center text-sm text-gray-400">
            Works with any YouTube video that has captions enabled.
          </p>
        )}
      </div>
    </main>
  );
}
