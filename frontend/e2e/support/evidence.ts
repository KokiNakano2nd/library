import path from "node:path";

export function resolveEvidenceDir(defaultRelativePath: string): string {
  return path.resolve(
    process.env.PLAYWRIGHT_EVIDENCE_DIR ?? defaultRelativePath,
  );
}
