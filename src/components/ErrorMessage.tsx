import { AlertCircle, RefreshCw } from "lucide-react";
import { ErrorResponse } from "@/types";

interface ErrorMessageProps {
  error: ErrorResponse;
  onRetry: () => void;
}

const ERROR_MESSAGES: Record<
  ErrorResponse["code"],
  { title: string; description: string; showRetry: boolean }
> = {
  INVALID_URL: {
    title: "Invalid YouTube URL",
    description:
      "That doesn't look like a YouTube URL. Try formats like youtube.com/watch?v=... or youtu.be/...",
    showRetry: false,
  },
  NO_TRANSCRIPT: {
    title: "No Transcript Available",
    description:
      "This video doesn't have captions or a transcript. Try a different video.",
    showRetry: false,
  },
  TRANSCRIPT_DISABLED: {
    title: "Transcripts Disabled",
    description:
      "The creator has disabled transcripts for this video. Try a different video.",
    showRetry: false,
  },
  CLAUDE_ERROR: {
    title: "AI Summarization Failed",
    description: "Something went wrong while generating the summary. Please try again.",
    showRetry: true,
  },
  UNKNOWN: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again.",
    showRetry: true,
  },
};

export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const info = ERROR_MESSAGES[error.code] ?? ERROR_MESSAGES.UNKNOWN;

  return (
    <div className="w-full rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10 p-6">
      <div className="flex gap-3 items-start">
        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 dark:text-red-300">
            {info.title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            {info.description}
          </p>
          {info.showRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
