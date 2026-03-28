export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { summarizeTranscript } from "@/lib/summarize";
import { SummarizeApiResponse } from "@/types";

const RequestSchema = z.object({
  videoId: z.string().min(1),
  transcript: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse<SummarizeApiResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body.", code: "UNKNOWN" },
      { status: 400 }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Missing videoId or transcript.", code: "UNKNOWN" },
      { status: 400 }
    );
  }

  const { videoId, transcript } = parsed.data;

  try {
    const summary = await summarizeTranscript(transcript);
    return NextResponse.json({
      success: true,
      videoId,
      summary,
      transcriptLength: transcript.length,
    });
  } catch (err: unknown) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { success: false, error: "AI summarization failed. Please try again.", code: "CLAUDE_ERROR" },
      { status: 502 }
    );
  }
}
