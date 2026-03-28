export interface SummarizeRequest {
  url: string;
}

export interface TranscriptResponse {
  success: true;
  videoId: string;
  transcript: string;
  segmentCount: number;
}

export interface SummarizeResponse {
  success: true;
  videoId: string;
  summary: {
    tldr: string;
    keyPoints: string[];
    topics: string[];
  };
  transcriptLength: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code:
    | "INVALID_URL"
    | "NO_TRANSCRIPT"
    | "TRANSCRIPT_DISABLED"
    | "CLAUDE_ERROR"
    | "UNKNOWN";
}

export type TranscriptApiResponse = TranscriptResponse | ErrorResponse;
export type SummarizeApiResponse = SummarizeResponse | ErrorResponse;
