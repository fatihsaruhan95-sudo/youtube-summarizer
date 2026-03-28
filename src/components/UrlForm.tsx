"use client";

import { useState, FormEvent } from "react";
import { Loader2, Youtube, Clipboard } from "lucide-react";
import { isValidYouTubeUrl } from "@/lib/youtube-utils";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }
    if (!isValidYouTubeUrl(url.trim())) {
      setError("This doesn't look like a valid YouTube URL.");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError("");
    } catch {
      // Clipboard access denied — ignore silently
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Youtube
            className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
            size={20}
          />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60 transition"
          />
        </div>
        <button
          type="button"
          onClick={handlePaste}
          disabled={isLoading}
          title="Paste from clipboard"
          className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 disabled:opacity-60 transition"
        >
          <Clipboard size={18} />
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-60 transition flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Working...</span>
            </>
          ) : (
            "Summarize"
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </form>
  );
}
