/** Shared allow-lists so only genuine package.json shaped data reaches the registry/vuln/AI pipeline. */

// Mirrors npm's real package name rules (lowercase, optional @scope/, limited punctuation).
export const NPM_PACKAGE_NAME_PATTERN = /^(@[a-z0-9-_.~]+\/)?[a-z0-9-_.~]+$/i;
export const MAX_PACKAGE_NAME_LENGTH = 214; // npm's own limit

// Covers semver ranges (^1.2.3, ~1.2.3, >=1.0.0, 1.x, 1.0.0 - 2.0.0), dist-tags (latest, next),
// and common protocol specifiers (workspace:*, file:, link:, npm:, git(+ssh|+https)://, github:, tarball URLs).
// Deliberately excludes quotes, backticks, braces, and newlines — no legitimate version specifier needs them,
// and free-form text (e.g. prompt-injection attempts) almost always relies on that punctuation.
export const SAFE_VERSION_SPECIFIER_PATTERN = /^[A-Za-z0-9 ._\-^~<>=*|+:/@#?&%]{1,256}$/;

export function isValidPackageName(name: string): boolean {
  return name.length > 0 && name.length <= MAX_PACKAGE_NAME_LENGTH && NPM_PACKAGE_NAME_PATTERN.test(name);
}

export function isValidVersionSpecifier(version: string): boolean {
  return SAFE_VERSION_SPECIFIER_PATTERN.test(version);
}
