import { z } from "zod";
import type { DependencySection, ParsedDependency } from "@/lib/types/dependency";
import { isValidPackageName, isValidVersionSpecifier } from "@/lib/dependencies/validation";

const versionRecordSchema = z.record(z.string(), z.string());

export const packageJsonSchema = z
  .object({
    name: z.string().optional(),
    version: z.string().optional(),
    dependencies: versionRecordSchema.optional(),
    devDependencies: versionRecordSchema.optional(),
    optionalDependencies: versionRecordSchema.optional(),
    peerDependencies: versionRecordSchema.optional(),
  })
  .passthrough();

export type PackageJson = z.infer<typeof packageJsonSchema>;

export class PackageJsonError extends Error {}

/** Turns a raw JSON.parse SyntaxError into a friendlier "line X" message. */
function describeJsonSyntaxError(text: string, error: SyntaxError): string {
  const match = error.message.match(/position (\d+)/);
  if (!match) return `Invalid JSON: ${error.message}`;
  const position = Number(match[1]);
  const upToError = text.slice(0, position);
  const line = upToError.split("\n").length;
  return `Invalid JSON: ${error.message.replace(/position \d+/, `line ${line}`)}`;
}

export function parseJsonText(text: string): unknown {
  if (!text || !text.trim()) {
    throw new PackageJsonError("Paste your package.json to begin.");
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new PackageJsonError(describeJsonSyntaxError(text, err));
    }
    throw new PackageJsonError("Invalid JSON.");
  }
}

export function validatePackageJson(raw: unknown): PackageJson {
  const result = packageJsonSchema.safeParse(raw);
  if (!result.success) {
    throw new PackageJsonError(
      "This JSON does not appear to be a valid package.json structure."
    );
  }
  const pkg = result.data;
  const hasDeps =
    (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) ||
    (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0);
  if (!hasDeps) {
    throw new PackageJsonError(
      "This JSON does not appear to be a package.json because no dependencies or devDependencies were found."
    );
  }
  return pkg;
}

const MAX_DEPENDENCIES = 150;

export function extractDependencies(pkg: PackageJson): ParsedDependency[] {
  const seen = new Set<string>();
  const dependencies: ParsedDependency[] = [];

  const sections: DependencySection[] = ["dependencies", "devDependencies"];
  for (const section of sections) {
    const entries = pkg[section];
    if (!entries) continue;
    for (const [name, requestedVersion] of Object.entries(entries)) {
      if (!isValidPackageName(name)) {
        throw new PackageJsonError(
          `"${name}" is not a valid npm package name. Check the ${section} field.`
        );
      }
      if (!isValidVersionSpecifier(requestedVersion)) {
        throw new PackageJsonError(
          `The version for "${name}" ("${requestedVersion}") doesn't look like a valid version range. Check the ${section} field.`
        );
      }
      if (seen.has(name)) continue;
      seen.add(name);
      dependencies.push({ name, requestedVersion, section });
    }
  }

  if (dependencies.length > MAX_DEPENDENCIES) {
    throw new PackageJsonError(
      `This package.json declares ${dependencies.length} dependencies, which exceeds the analysis limit of ${MAX_DEPENDENCIES}.`
    );
  }

  return dependencies;
}
