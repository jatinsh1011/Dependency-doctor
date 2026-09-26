import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  extractDependencies,
  parseJsonText,
  PackageJsonError,
  validatePackageJson,
} from "@/lib/dependencies/parser";
import { prepareAnalysisContext } from "@/lib/dependencies/analyzer";
import { AIAnalysisError, AIConfigError, createAIAnalyzer } from "@/lib/ai/client";
import type { ParsedDependency } from "@/lib/types/dependency";
import type { AnalyzeStreamEvent, ProgressStepKey } from "@/lib/types/analysis";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 300_000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

// In-memory limiter: resets on cold start, adequate for a single-instance MVP.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

const requestSchema = z.object({ packageJsonText: z.string().max(MAX_BODY_BYTES) });

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return jsonError("Too many requests. Please wait a few minutes and try again.", 429);
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError("Request body is too large.", 413);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsedBody = requestSchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonError("Missing packageJsonText field.", 400);
  }

  let dependencies: ParsedDependency[];
  try {
    const raw = parseJsonText(parsedBody.data.packageJsonText);
    const pkg = validatePackageJson(raw);
    dependencies = extractDependencies(pkg);
  } catch (err) {
    const message = err instanceof PackageJsonError ? err.message : "Invalid package.json.";
    return jsonError(message, 400);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(event: AnalyzeStreamEvent) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }
      function progress(step: ProgressStepKey, label: string) {
        send({ type: "progress", step, label, status: "done" });
      }

      try {
        progress("parse", "Reading package.json");
        progress("extract", `Detecting dependencies (${dependencies.length} found)`);

        const context = await prepareAnalysisContext(dependencies, {
          onRegistryDone: () => progress("registry", "Checking package versions"),
          onVulnerabilitiesDone: () => progress("vulnerabilities", "Checking vulnerabilities"),
          onChainsDone: () => progress("chains", "Analyzing compatibility"),
        });

        let analyzer;
        try {
          analyzer = createAIAnalyzer();
        } catch (err) {
          send({
            type: "error",
            message:
              err instanceof AIConfigError
                ? "AI analysis is not configured on the server. Set AI_API_KEY to enable it."
                : "Dependency information was retrieved, but the AI analysis could not be completed.",
          });
          return;
        }

        const result = await analyzer.analyze(context);
        progress("ai", "Preparing upgrade plan");
        send({ type: "result", data: result });
      } catch (err) {
        send({
          type: "error",
          message:
            err instanceof AIAnalysisError
              ? "Dependency information was retrieved, but the AI analysis could not be completed. Please try again."
              : "We couldn't retrieve dependency information right now. Please try again.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
