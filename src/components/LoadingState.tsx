"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Fetching transcript", duration: 2500 },
  { label: "Reading transcript", duration: 2500 },
  { label: "Generating summary with AI", duration: Infinity },
];

export default function LoadingState() {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const timer = setTimeout(() => {
      setStep((s) => s + 1);
    }, STEPS[step].duration);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        </div>
        <div>
          <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
            {STEPS[step].label}
            {dots}
          </p>
          <p className="text-sm text-gray-400 mt-1">This may take up to 15 seconds</p>
        </div>
        <div className="flex gap-2 mt-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${
                i <= step ? "bg-red-500" : "bg-gray-200 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
