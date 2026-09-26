import type { AnalysisInput } from "@/lib/types/analysis";
import type { DependencyAnalysis } from "@/lib/types/analysis";
import { dependencyAnalysisSchema, dependencyAnalysisJsonSchema } from "@/lib/ai/schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompt";
import { fetchWithTimeout } from "@/lib/dependencies/util";

export interface AIAnalyzer {
  analyze(input: AnalysisInput): Promise<DependencyAnalysis>;
}

export class AIConfigError extends Error {}
export class AIAnalysisError extends Error {}

interface OpenAIChatResponse {
  choices?: { message?: { content?: string } }[];
}

/** OpenAI Chat Completions with strict JSON-schema structured outputs. */
export class OpenAIAnalyzer implements AIAnalyzer {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.AI_MODEL || "gpt-4o-mini"
  ) {}

  async analyze(input: AnalysisInput): Promise<DependencyAnalysis> {
    let res: Response;
    try {
      res = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            temperature: 0.2,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: buildUserPrompt(input) },
            ],
            response_format: {
              type: "json_schema",
              json_schema: dependencyAnalysisJsonSchema,
            },
          }),
        },
        30000
      );
    } catch {
      throw new AIAnalysisError("The AI request timed out or failed to connect.");
    }

    if (!res.ok) {
      throw new AIAnalysisError(`AI provider returned an error (${res.status}).`);
    }

    const data: OpenAIChatResponse = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AIAnalysisError("AI provider returned an empty response.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new AIAnalysisError("AI provider returned malformed JSON.");
    }

    const result = dependencyAnalysisSchema.safeParse(parsed);
    if (!result.success) {
      throw new AIAnalysisError("AI response did not match the expected schema.");
    }

    return result.data;
  }
}

export function createAIAnalyzer(): AIAnalyzer {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIConfigError("No AI provider API key is configured.");
  }
  return new OpenAIAnalyzer(apiKey);
}
