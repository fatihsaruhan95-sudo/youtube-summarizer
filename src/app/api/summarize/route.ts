export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractVideoId } from "@/lib/youtube-utils";
import { fetchTranscript } from "@/lib/transcript";
import { summarizeTranscript } from "@/lib/summarize";
import { ApiResponse } from "@/types";

const RequestSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

type AppError = Error & { code?: string };

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body.", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Please provide a valid URL.", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  const { url } = parsed.data;

  // 2. Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      {
        success: false,
        error: "That doesn't look like a valid YouTube URL.",
        code: "INVALID_URL",
      },
      { status: 400 }
    );
  }

  // 3. Fetch transcript
  let transcript: { text: string; segmentCount: number };
  try {
    transcript = await fetchTranscript(videoId);
  } catch (err: unknown) {
    const appErr = err as AppError;
    const code = appErr.code ?? "UNKNOWN";

    if (code === "TRANSCRIPT_DISABLED") {
      return NextResponse.json(
        {
          success: false,
          error: "The creator has disabled transcripts for this video.",
          code: "TRANSCRIPT_DISABLED",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "No transcript is available for this video.",
        code: "NO_TRANSCRIPT",
      },
      { status: 422 }
    );
  }

  // 4. Summarize with Claude
  let summary: { tldr: string; keyPoints: string[]; topics: string[] };
  try {
    summary = await summarizeTranscript(transcript.text);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "AI summarization failed. Please try again.",
        code: "CLAUDE_ERROR",
      },
      { status: 502 }
    );
  }

  // 5. Return success
  return NextResponse.json({
    success: true,
    videoId,
    summary,
    transcriptLength: transcript.text.length,
  });
}
