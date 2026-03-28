import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SummaryResult {
  tldr: string;
  keyPoints: string[];
  topics: string[];
}

const SYSTEM_PROMPT = `You are a helpful video summarization assistant.
Analyze the provided YouTube video transcript and return a JSON object with exactly this structure:
{
  "tldr": "2-3 sentence overview of what this video is about",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "topics": ["topic1", "topic2", "topic3"]
}

Rules:
- tldr: 2-3 clear, informative sentences summarizing the main content
- keyPoints: 5-8 specific, actionable bullet points covering the main takeaways
- topics: 3-5 short topic tags (e.g. "Machine Learning", "Python", "Productivity")
- Return ONLY valid JSON, no markdown code blocks, no extra text
- If the transcript is in a language other than English, summarize in English`;

async function callClaude(transcript: string): Promise<SummaryResult> {
  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Please summarize this video transcript:\n\n${transcript}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return JSON.parse(text) as SummaryResult;
  } catch {
    // Retry with stricter instructions
    const retry = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please summarize this video transcript:\n\n${transcript}`,
        },
        { role: "assistant", content: text },
        {
          role: "user",
          content:
            "Your response was not valid JSON. Return ONLY the JSON object, nothing else.",
        },
      ],
    });

    const retryText =
      retry.content[0].type === "text" ? retry.content[0].text : "";
    return JSON.parse(retryText) as SummaryResult;
  }
}

export async function summarizeTranscript(
  transcript: string
): Promise<SummaryResult> {
  try {
    return await callClaude(transcript);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    throw Object.assign(new Error(`Claude summarization failed: ${message}`), {
      code: "CLAUDE_ERROR",
    });
  }
}
