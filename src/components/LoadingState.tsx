"use client";

import { useEffect, useState } from "react";

interface LoadingStateProps {
  label: string;
}

export default function LoadingState({ label }: LoadingStateProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        </div>
        <div>
          <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
            {label}{dots}
          </p>
          <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
        </div>
      </div>
    </div>
  );
}
