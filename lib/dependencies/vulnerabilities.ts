import type { VulnerabilityRecord, VulnerabilitySeverity } from "@/lib/types/dependency";
import { fetchWithTimeout, pMap } from "@/lib/dependencies/util";

interface OsvEvent {
  introduced?: string;
  fixed?: string;
  last_affected?: string;
}

interface OsvAffected {
  ranges?: { events: OsvEvent[] }[];
  versions?: string[];
}

interface OsvSeverity {
  type: string;
  score: string;
}

interface OsvVuln {
  id: string;
  aliases?: string[];
  summary?: string;
  details?: string;
  severity?: OsvSeverity[];
  database_specific?: { severity?: string };
  affected?: OsvAffected[];
  references?: { url: string }[];
}

interface OsvQueryResponse {
  vulns?: OsvVuln[];
}

function normalizeSeverity(vuln: OsvVuln): VulnerabilitySeverity {
  const declared = vuln.database_specific?.severity?.toUpperCase();
  if (declared === "CRITICAL" || declared === "HIGH" || declared === "MEDIUM" || declared === "LOW") {
    return declared;
  }
  const cvss = vuln.severity?.find((s) => s.type === "CVSS_V3")?.score;
  if (cvss) {
    const scoreMatch = cvss.match(/(\d+(\.\d+)?)$/);
    const score = scoreMatch ? Number(scoreMatch[1]) : null;
    if (score !== null) {
      if (score >= 9) return "CRITICAL";
      if (score >= 7) return "HIGH";
      if (score >= 4) return "MEDIUM";
      return "LOW";
    }
  }
  return "UNKNOWN";
}

function extractFixedVersion(vuln: OsvVuln): string | null {
  for (const affected of vuln.affected ?? []) {
    for (const range of affected.ranges ?? []) {
      for (const event of range.events) {
        if (event.fixed) return event.fixed;
      }
    }
  }
  return null;
}

function extractAffectedVersions(vuln: OsvVuln): string | null {
  const versionSets = (vuln.affected ?? [])
    .map((a) => a.versions)
    .filter((v): v is string[] => Boolean(v && v.length));
  if (versionSets.length) {
    const flat = versionSets.flat();
    return flat.length > 6
      ? `${flat.slice(0, 6).join(", ")}, and ${flat.length - 6} more`
      : flat.join(", ");
  }
  return null;
}

function toVulnerabilityRecord(vuln: OsvVuln): VulnerabilityRecord {
  return {
    id: vuln.id,
    aliases: vuln.aliases ?? [],
    severity: normalizeSeverity(vuln),
    summary: vuln.summary ?? vuln.details?.slice(0, 300) ?? "No summary available.",
    affectedVersions: extractAffectedVersions(vuln),
    fixedVersion: extractFixedVersion(vuln),
    references: (vuln.references ?? []).map((r) => r.url).slice(0, 3),
  };
}

/** Queries OSV.dev for known vulnerabilities affecting a specific resolved npm version. */
export async function queryVulnerabilities(
  name: string,
  version: string | null
): Promise<VulnerabilityRecord[]> {
  if (!version) return [];
  try {
    const res = await fetchWithTimeout(
      "https://api.osv.dev/v1/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          package: { name, ecosystem: "npm" },
        }),
      },
      8000
    );
    if (!res.ok) return [];
    const data: OsvQueryResponse = await res.json();
    return (data.vulns ?? []).map(toVulnerabilityRecord);
  } catch {
    return [];
  }
}

export async function fetchAllVulnerabilities(
  packages: { name: string; version: string | null }[]
): Promise<Map<string, VulnerabilityRecord[]>> {
  const results = await pMap(
    packages,
    (pkg) => queryVulnerabilities(pkg.name, pkg.version),
    6
  );
  return new Map(packages.map((pkg, i) => [pkg.name, results[i]]));
}
