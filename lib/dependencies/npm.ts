import semver from "semver";
import type { PackageMetadataResult } from "@/lib/types/dependency";
import { fetchWithTimeout, pMap } from "@/lib/dependencies/util";
import { isValidPackageName } from "@/lib/dependencies/validation";

export interface PackageRegistry {
  getPackageMetadata(packageName: string): Promise<PackageMetadataResult>;
}

interface NpmVersionInfo {
  peerDependencies?: Record<string, string>;
  deprecated?: string;
}

interface NpmRegistryResponse {
  name: string;
  description?: string;
  "dist-tags"?: { latest?: string };
  versions?: Record<string, NpmVersionInfo>;
}

export class NpmRegistry implements PackageRegistry {
  private readonly baseUrl = "https://registry.npmjs.org";

  async getPackageMetadata(packageName: string): Promise<PackageMetadataResult> {
    if (!isValidPackageName(packageName)) {
      return { name: packageName, found: false, error: "Malformed package name." };
    }

    try {
      const res = await fetchWithTimeout(
        `${this.baseUrl}/${encodeURIComponent(packageName).replace("%40", "@")}`,
        { headers: { Accept: "application/json" } },
        8000
      );

      if (res.status === 404) {
        return {
          name: packageName,
          found: false,
          error: `Could not find package "${packageName}".`,
        };
      }
      if (!res.ok) {
        return {
          name: packageName,
          found: false,
          error: `Registry request failed (${res.status}).`,
        };
      }

      const data: NpmRegistryResponse = await res.json();
      const latestVersion = data["dist-tags"]?.latest ?? null;
      const versions = Object.keys(data.versions ?? {});
      const latestVersionInfo = latestVersion ? data.versions?.[latestVersion] : undefined;

      return {
        name: packageName,
        found: true,
        latestVersion,
        versions,
        deprecated: Boolean(latestVersionInfo?.deprecated),
        peerDependencies: latestVersionInfo?.peerDependencies ?? null,
        description: data.description ?? null,
      };
    } catch {
      return {
        name: packageName,
        found: false,
        error: "Network error while contacting the npm registry.",
      };
    }
  }
}

export async function fetchAllMetadata(
  names: string[],
  registry: PackageRegistry = new NpmRegistry()
): Promise<Map<string, PackageMetadataResult>> {
  const results = await pMap(names, (name) => registry.getPackageMetadata(name), 6);
  return new Map(names.map((name, i) => [name, results[i]]));
}

/** Best-effort resolution of a semver range to a concrete version for vulnerability lookups. */
export function resolveVersionForRange(
  range: string,
  availableVersions: string[]
): string | null {
  const cleanRange = range.trim();
  if (cleanRange === "latest" || cleanRange === "*" || cleanRange === "") {
    return availableVersions.length
      ? availableVersions.sort(semver.rcompare)[0]
      : null;
  }
  if (!semver.validRange(cleanRange)) return null;

  if (availableVersions.length) {
    const match = semver.maxSatisfying(availableVersions, cleanRange);
    if (match) return match;
  }
  return semver.minVersion(cleanRange)?.version ?? null;
}
