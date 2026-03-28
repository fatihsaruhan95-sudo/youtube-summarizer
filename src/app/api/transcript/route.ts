export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractVideoId } from "@/lib/youtube-utils";
import { fetchTranscript } from "@/lib/transcript";
import { TranscriptApiResponse } from "@/types";

const RequestSchema = z.object({
  url: z.string().min(1),
});

type AppError = Error & { code?: string };

export async function POST(request: NextRequest): Promise<NextResponse<TranscriptApiResponse>> {
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

  const videoId = extractVideoId(parsed.data.url);
  if (!videoId) {
    return NextResponse.json(
      { success: false, error: "That doesn't look like a valid YouTube URL.", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  try {
    const transcript = await fetchTranscript(videoId);
    return NextResponse.json({
      success: true,
      videoId,
      transcript: transcript.text,
      segmentCount: transcript.segmentCount,
    });
  } catch (err: unknown) {
    const appErr = err as AppError;
    if (appErr.code === "TRANSCRIPT_DISABLED") {
      return NextResponse.json(
        { success: false, error: "The creator has disabled transcripts for this video.", code: "TRANSCRIPT_DISABLED" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: "No transcript is available for this video.", code: "NO_TRANSCRIPT" },
      { status: 422 }
    );
  }
}
