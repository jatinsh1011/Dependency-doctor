import semver from "semver";
import type { ParsedDependency } from "@/lib/types/dependency";
import type {
  AnalysisInput,
  DependencyContextItem,
  PeerDependencyIssue,
} from "@/lib/types/analysis";
import { fetchAllMetadata, resolveVersionForRange } from "@/lib/dependencies/npm";
import { fetchAllVulnerabilities } from "@/lib/dependencies/vulnerabilities";

export interface PrepareContextCallbacks {
  onRegistryDone?: () => void;
  onVulnerabilitiesDone?: () => void;
  onChainsDone?: () => void;
}

export async function prepareAnalysisContext(
  parsed: ParsedDependency[],
  callbacks: PrepareContextCallbacks = {}
): Promise<AnalysisInput> {
  const names = parsed.map((d) => d.name);
  const metadataByName = await fetchAllMetadata(names);
  callbacks.onRegistryDone?.();

  const resolvedByName = new Map<string, string | null>();
  for (const dep of parsed) {
    const metadata = metadataByName.get(dep.name);
    const resolved =
      metadata && metadata.found
        ? resolveVersionForRange(dep.requestedVersion, metadata.versions)
        : null;
    resolvedByName.set(dep.name, resolved);
  }

  const vulnByName = await fetchAllVulnerabilities(
    parsed.map((dep) => ({ name: dep.name, version: resolvedByName.get(dep.name) ?? null }))
  );
  callbacks.onVulnerabilitiesDone?.();

  const dependencies: DependencyContextItem[] = parsed.map((dep) => {
    const metadata = metadataByName.get(dep.name);
    const resolvedVersion = resolvedByName.get(dep.name) ?? null;
    const latestVersion = metadata && metadata.found ? metadata.latestVersion : null;

    let isMajorBehind = false;
    let isBehind = false;
    if (resolvedVersion && latestVersion && semver.valid(resolvedVersion) && semver.valid(latestVersion)) {
      isBehind = semver.lt(resolvedVersion, latestVersion);
      isMajorBehind = isBehind && semver.major(latestVersion) > semver.major(resolvedVersion);
    }

    return {
      name: dep.name,
      section: dep.section,
      requestedVersion: dep.requestedVersion,
      resolvedVersion,
      latestVersion,
      deprecated: metadata && metadata.found ? metadata.deprecated : false,
      packageFound: Boolean(metadata?.found),
      registryError: metadata && !metadata.found ? metadata.error : null,
      isMajorBehind,
      isBehind,
      vulnerabilities: vulnByName.get(dep.name) ?? [],
    };
  });

  // Peer-dependency relationships are only trusted when backed by real npm registry metadata.
  const peerDependencyIssues: PeerDependencyIssue[] = [];
  const declaredByName = new Map(parsed.map((d) => [d.name, d.requestedVersion]));
  for (const dep of parsed) {
    const metadata = metadataByName.get(dep.name);
    if (!metadata || !metadata.found || !metadata.peerDependencies) continue;
    for (const [peerName, peerRange] of Object.entries(metadata.peerDependencies)) {
      const declaredVersion = declaredByName.get(peerName);
      if (!declaredVersion) continue;
      let likelyConflict = false;
      try {
        likelyConflict = !semver.intersects(peerRange, declaredVersion, { includePrerelease: true });
      } catch {
        likelyConflict = false;
      }
      peerDependencyIssues.push({
        package: dep.name,
        requiresPeer: peerName,
        peerRange,
        declaredVersion,
        likelyConflict,
      });
    }
  }
  callbacks.onChainsDone?.();

  return { dependencies, peerDependencyIssues, hasLockfile: false };
}
