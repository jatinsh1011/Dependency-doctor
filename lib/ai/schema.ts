import { z } from "zod";

const breakingChangeSchema = z.object({
  change: z.string(),
  impact: z.string(),
  migration: z.string(),
});

const vulnerabilitySchema = z.object({
  id: z.string().nullable(),
  severity: z.string().nullable(),
  affectedVersions: z.string().nullable(),
  fixedVersion: z.string().nullable(),
});

const dependencyFindingSchema = z.object({
  name: z.string(),
  currentVersion: z.string(),
  latestVersion: z.string().nullable(),
  status: z.enum(["vulnerable", "outdated", "current", "incompatible", "unknown"]),
  priority: z.enum(["critical", "high", "medium", "low", "optional"]),
  action: z.enum(["upgrade", "investigate", "keep", "none"]),
  reason: z.string(),
  vulnerability: vulnerabilitySchema,
  breakingChanges: z.array(breakingChangeSchema),
  relatedDependencies: z.array(z.string()),
});

const upgradeChainSchema = z.object({
  trigger: z.string(),
  requiredUpgrades: z.array(
    z.object({ package: z.string(), from: z.string(), to: z.string(), reason: z.string() })
  ),
  explanation: z.string(),
});

const majorUpdateSchema = z.object({
  package: z.string(),
  from: z.string(),
  to: z.string(),
  reason: z.string(),
  breakingChanges: z.array(breakingChangeSchema),
  relatedDependencies: z.array(z.string()),
});

const upgradeStepSchema = z.object({
  step: z.number(),
  package: z.string(),
  from: z.string(),
  to: z.string(),
  reason: z.string(),
});

export const dependencyAnalysisSchema = z.object({
  summary: z.object({
    totalDependencies: z.number(),
    vulnerable: z.number(),
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    outdated: z.number(),
    majorUpdates: z.number(),
    healthy: z.number(),
  }),
  dependencies: z.array(dependencyFindingSchema),
  upgradeChains: z.array(upgradeChainSchema),
  majorUpdates: z.array(majorUpdateSchema),
  recommendedUpgradePlan: z.array(upgradeStepSchema),
  overallAssessment: z.string(),
});

const breakingChangeJsonSchema = {
  type: "object",
  properties: {
    change: { type: "string" },
    impact: { type: "string" },
    migration: { type: "string" },
  },
  required: ["change", "impact", "migration"],
  additionalProperties: false,
};

/** Hand-authored JSON Schema mirroring dependencyAnalysisSchema, for OpenAI structured outputs (strict mode). */
export const dependencyAnalysisJsonSchema = {
  name: "dependency_analysis",
  strict: true,
  schema: {
    type: "object",
    properties: {
      summary: {
        type: "object",
        properties: {
          totalDependencies: { type: "integer" },
          vulnerable: { type: "integer" },
          critical: { type: "integer" },
          high: { type: "integer" },
          medium: { type: "integer" },
          outdated: { type: "integer" },
          majorUpdates: { type: "integer" },
          healthy: { type: "integer" },
        },
        required: [
          "totalDependencies",
          "vulnerable",
          "critical",
          "high",
          "medium",
          "outdated",
          "majorUpdates",
          "healthy",
        ],
        additionalProperties: false,
      },
      dependencies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            currentVersion: { type: "string" },
            latestVersion: { type: ["string", "null"] },
            status: {
              type: "string",
              enum: ["vulnerable", "outdated", "current", "incompatible", "unknown"],
            },
            priority: {
              type: "string",
              enum: ["critical", "high", "medium", "low", "optional"],
            },
            action: { type: "string", enum: ["upgrade", "investigate", "keep", "none"] },
            reason: { type: "string" },
            vulnerability: {
              type: "object",
              properties: {
                id: { type: ["string", "null"] },
                severity: { type: ["string", "null"] },
                affectedVersions: { type: ["string", "null"] },
                fixedVersion: { type: ["string", "null"] },
              },
              required: ["id", "severity", "affectedVersions", "fixedVersion"],
              additionalProperties: false,
            },
            breakingChanges: { type: "array", items: breakingChangeJsonSchema },
            relatedDependencies: { type: "array", items: { type: "string" } },
          },
          required: [
            "name",
            "currentVersion",
            "latestVersion",
            "status",
            "priority",
            "action",
            "reason",
            "vulnerability",
            "breakingChanges",
            "relatedDependencies",
          ],
          additionalProperties: false,
        },
      },
      upgradeChains: {
        type: "array",
        items: {
          type: "object",
          properties: {
            trigger: { type: "string" },
            requiredUpgrades: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  package: { type: "string" },
                  from: { type: "string" },
                  to: { type: "string" },
                  reason: { type: "string" },
                },
                required: ["package", "from", "to", "reason"],
                additionalProperties: false,
              },
            },
            explanation: { type: "string" },
          },
          required: ["trigger", "requiredUpgrades", "explanation"],
          additionalProperties: false,
        },
      },
      majorUpdates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            package: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
            reason: { type: "string" },
            breakingChanges: { type: "array", items: breakingChangeJsonSchema },
            relatedDependencies: { type: "array", items: { type: "string" } },
          },
          required: ["package", "from", "to", "reason", "breakingChanges", "relatedDependencies"],
          additionalProperties: false,
        },
      },
      recommendedUpgradePlan: {
        type: "array",
        items: {
          type: "object",
          properties: {
            step: { type: "integer" },
            package: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
            reason: { type: "string" },
          },
          required: ["step", "package", "from", "to", "reason"],
          additionalProperties: false,
        },
      },
      overallAssessment: { type: "string" },
    },
    required: [
      "summary",
      "dependencies",
      "upgradeChains",
      "majorUpdates",
      "recommendedUpgradePlan",
      "overallAssessment",
    ],
    additionalProperties: false,
  },
};
