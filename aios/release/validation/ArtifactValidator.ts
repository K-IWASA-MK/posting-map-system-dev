import * as fs from "fs";
import * as crypto from "crypto";

export class ArtifactValidator {
  /**
   * Validates that each artifact file exists, is non-empty, and has a matching SHA-256 hash if expected.
   */
  public static validate(artifacts: { filePath: string; expectedHash?: string }[]): { valid: boolean; error?: string } {
    if (!artifacts || artifacts.length === 0) {
      return { valid: false, error: "Artifacts list is empty." };
    }

    for (const art of artifacts) {
      if (!fs.existsSync(art.filePath)) {
        return { valid: false, error: `Artifact file does not exist: ${art.filePath}` };
      }

      const stats = fs.statSync(art.filePath);
      if (stats.isFile() && stats.size === 0) {
        return { valid: false, error: `Artifact file is empty: ${art.filePath}` };
      }

      if (art.expectedHash) {
        try {
          const content = fs.readFileSync(art.filePath);
          const actualHash = crypto.createHash("sha256").update(content).digest("hex");
          if (actualHash !== art.expectedHash) {
            return {
              valid: false,
              error: `Artifact integrity mismatch for ${art.filePath}. Expected: ${art.expectedHash}, Got: ${actualHash}`
            };
          }
        } catch (err: any) {
          return { valid: false, error: `Failed to compute hash for ${art.filePath}: ${err.message}` };
        }
      }
    }

    return { valid: true };
  }
}
