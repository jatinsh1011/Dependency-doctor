export type DependencySection = "dependencies" | "devDependencies";

export interface ParsedDependency {
  name: string;
  requestedVersion: string;
  section: DependencySection;
}

export interface PackageMetadata {
  name: string;
  latestVersion: string | null;
  versions: string[];
  deprecated: boolean;
  peerDependencies: Record<string, string> | null;
  description: string | null;
  found: true;
}

export interface PackageMetadataNotFound {
  name: string;
  found: false;
  error: string;
}

export type PackageMetadataResult = PackageMetadata | PackageMetadataNotFound;

export type VulnerabilitySeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface VulnerabilityRecord {
  id: string;
  aliases: string[];
  severity: VulnerabilitySeverity;
  summary: string;
  affectedVersions: string | null;
  fixedVersion: string | null;
  references: string[];
}

export interface DependencyFacts {
  name: string;
  requestedVersion: string;
  section: DependencySection;
  metadata: PackageMetadataResult;
  vulnerabilities: VulnerabilityRecord[];
}
