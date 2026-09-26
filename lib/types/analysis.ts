export type DependencyStatus =
  | "vulnerable"
  | "outdated"
  | "current"
  | "incompatible"
  | "unknown";

export type DependencyPriority = "critical" | "high" | "medium" | "low" | "optional";

export type DependencyAction = "upgrade" | "investigate" | "keep" | "none";

export interface BreakingChange {
  change: string;
  impact: string;
  migration: string;
}

export interface DependencyFinding {
  name: string;
  currentVersion: string;
  latestVersion: string | null;
  status: DependencyStatus;
  priority: DependencyPriority;
  action: DependencyAction;
  reason: string;
  vulnerability: {
    id: string | null;
    severity: string | null;
    affectedVersions: string | null;
    fixedVersion: string | null;
  };
  breakingChanges: BreakingChange[];
  relatedDependencies: string[];
}

export interface UpgradeChain {
  trigger: string;
  requiredUpgrades: {
    package: string;
    from: string;
    to: string;
    reason: string;
  }[];
  explanation: string;
}

export interface MajorUpdate {
  package: string;
  from: string;
  to: string;
  reason: string;
  breakingChanges: BreakingChange[];
  relatedDependencies: string[];
}

export interface UpgradeStep {
  step: number;
  package: string;
  from: string;
  to: string;
  reason: string;
}

export interface DependencyAnalysis {
  summary: {
    totalDependencies: number;
    vulnerable: number;
    critical: number;
    high: number;
    medium: number;
    outdated: number;
    majorUpdates: number;
    healthy: number;
  };
  dependencies: DependencyFinding[];
  upgradeChains: UpgradeChain[];
  majorUpdates: MajorUpdate[];
  recommendedUpgradePlan: UpgradeStep[];
  overallAssessment: string;
}

export interface DependencyContextItem {
  name: string;
  section: "dependencies" | "devDependencies";
  requestedVersion: string;
  resolvedVersion: string | null;
  latestVersion: string | null;
  deprecated: boolean;
  packageFound: boolean;
  registryError: string | null;
  isMajorBehind: boolean;
  isBehind: boolean;
  vulnerabilities: import("./dependency").VulnerabilityRecord[];
}

export interface PeerDependencyIssue {
  package: string;
  requiresPeer: string;
  peerRange: string;
  declaredVersion: string;
  likelyConflict: boolean;
}

export interface AnalysisInput {
  dependencies: DependencyContextItem[];
  peerDependencyIssues: PeerDependencyIssue[];
  hasLockfile: false;
}

export type ProgressStepKey =
  | "parse"
  | "extract"
  | "registry"
  | "vulnerabilities"
  | "chains"
  | "ai";

export interface ProgressEvent {
  type: "progress";
  step: ProgressStepKey;
  label: string;
  status: "done";
}

export interface ResultEvent {
  type: "result";
  data: DependencyAnalysis;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type AnalyzeStreamEvent = ProgressEvent | ResultEvent | ErrorEvent;
