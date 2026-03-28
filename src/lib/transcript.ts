const MAX_CHARS = 80_000;

function cleanText(text: string): string {
  return text
    .replace(/\[.*?\]/g, "") // Remove [Music], [Applause], etc.
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAtSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastPeriod = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );
  return lastPeriod > 0
    ? truncated.slice(0, lastPeriod + 1) + " [transcript truncated]"
    : truncated + " [transcript truncated]";
}

export async function fetchTranscript(videoId: string): Promise<{
  text: string;
  segmentCount: number;
}> {
  let segments;

  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    // Try English first, then fall back to any available language
    try {
      segments = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: "en",
      });
    } catch {
      segments = await YoutubeTranscript.fetchTranscript(videoId);
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "";

    if (
      message.includes("disabled") ||
      message.includes("Transcript is disabled")
    ) {
      throw Object.assign(new Error("Transcript is disabled for this video."), {
        code: "TRANSCRIPT_DISABLED",
      });
    }

    throw Object.assign(
      new Error("No transcript found for this video."),
      { code: "NO_TRANSCRIPT" }
    );
  }

  if (!segments || segments.length === 0) {
    throw Object.assign(new Error("No transcript found for this video."), {
      code: "NO_TRANSCRIPT",
    });
  }

  const rawText = segments.map((s) => s.text).join(" ");
  const cleaned = cleanText(rawText);
  const text = truncateAtSentence(cleaned, MAX_CHARS);

  return {
    text,
    segmentCount: segments.length,
  };
}
