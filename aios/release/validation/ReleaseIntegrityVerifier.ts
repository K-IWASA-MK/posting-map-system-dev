import * as path from "path";

export class ReleaseIntegrityVerifier {
  /**
   * Verifies that the release version matches strict SemVer (major.minor.patch)
   * and that all artifact file paths reside strictly within the workspace root.
   */
  public static validate(
    version: string,
    artifacts: { filePath: string }[],
    workspaceRoot: string
  ): { valid: boolean; error?: string } {
    // 1. SemVer Validation
    const semVerRegex = /^\d+\.\d+\.\d+$/;
    if (!semVerRegex.test(version)) {
      return {
        valid: false,
        error: `Invalid version format: "${version}". Version must strictly follow major.minor.patch (e.g. 1.2.3).`
      };
    }

    // 2. Path Traversal & Boundary Verification
    const resolvedRoot = path.resolve(workspaceRoot);
    for (const art of artifacts) {
      if (art.filePath.includes("..")) {
        return {
          valid: false,
          error: `Path traversal violation: path contains ".." in "${art.filePath}"`
        };
      }

      const resolvedPath = path.resolve(art.filePath);
      if (!resolvedPath.startsWith(resolvedRoot)) {
        return {
          valid: false,
          error: `Path boundary violation: file "${art.filePath}" is outside workspace root.`
        };
      }
    }

    return { valid: true };
  }
}
