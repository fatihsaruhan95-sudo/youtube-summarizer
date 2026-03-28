const MAX_CHARS = 80_000;

const CLIENT_VERSION = "20.10.38";

const INNERTUBE_URL =
  "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

async function getCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
  const res = await fetch(INNERTUBE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": `com.google.android.youtube/${CLIENT_VERSION} (Linux; U; Android 14)`,
    },
    body: JSON.stringify({
      videoId,
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: CLIENT_VERSION,
        },
      },
    }),
  });

  if (!res.ok) {
    throw Object.assign(new Error("Failed to reach YouTube."), {
      code: "NO_TRANSCRIPT",
    });
  }

  const data = (await res.json()) as {
    captions?: {
      playerCaptionsTracklistRenderer?: {
        captionTracks?: CaptionTrack[];
      };
    };
  };

  const tracks =
    data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!tracks || tracks.length === 0) {
    throw Object.assign(new Error("No captions available for this video."), {
      code: "NO_TRANSCRIPT",
    });
  }

  return tracks;
}

async function fetchCaptionText(trackUrl: string): Promise<string> {
  // Try JSON format first
  try {
    const res = await fetch(trackUrl + "&fmt=json3");
    if (res.ok) {
      const text = await res.text();
      if (text.trimStart().startsWith("{")) {
        const json = JSON.parse(text) as {
          events?: Array<{ segs?: Array<{ utf8?: string }> }>;
        };
        if (json.events) {
          return json.events
            .flatMap((e) => e.segs ?? [])
            .map((s) => s.utf8 ?? "")
            .join(" ");
        }
      }
    }
  } catch {
    // fall through to XML
  }

  // XML fallback — handle both YouTube XML formats
  const xmlRes = await fetch(trackUrl);
  const xml = await xmlRes.text();

  const segments: string[] = [];

  // Format 1: <text start="..." dur="...">content</text>  (older API)
  const textRegex = /<text[^>]*>([^<]*)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = textRegex.exec(xml)) !== null) {
    segments.push(m[1]);
  }

  // Format 2: <p t="..." d="..."><s>word</s>...</p>  (InnerTube Android)
  if (segments.length === 0) {
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    while ((m = sRegex.exec(xml)) !== null) {
      segments.push(m[1]);
    }
  }

  // Format 3: strip all tags as last resort
  const raw =
    segments.length > 0
      ? segments.join(" ")
      : xml.replace(/<[^>]+>/g, " ");

  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function cleanText(text: string): string {
  return text
    .replace(/\[.*?\]/g, "")
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
  const tracks = await getCaptionTracks(videoId);

  // Prefer manual English, then auto-generated English, then first available
  const preferred =
    tracks.find((t) => t.languageCode === "en" && !t.kind) ??
    tracks.find((t) => t.languageCode === "en") ??
    tracks[0];

  const rawText = await fetchCaptionText(preferred.baseUrl);
  const cleaned = cleanText(rawText);
  const text = truncateAtSentence(cleaned, MAX_CHARS);

  return {
    text,
    segmentCount: text.split(/\s+/).length,
  };
}
