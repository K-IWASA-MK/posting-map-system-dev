import * as crypto from "crypto";

export class OutputHashGenerator {
  /**
   * Generates a deterministic SHA-256 hash from the DashboardDataContract content.
   * Temporarily ignores generatedAt, executionId, and lineage.outputHash to guarantee
   * identical outputHash for identical input contents regardless of run timestamp.
   */
  public static generate(data: any): string {
    // Deep clone to avoid mutating the original object
    const clone = JSON.parse(JSON.stringify(data));
    
    if (clone.metadata) {
      clone.metadata.generatedAt = "";
      clone.metadata.executionId = "";
    }
    
    if (clone.lineage) {
      clone.lineage.outputHash = "";
    }

    const canonicalString = JSON.stringify(clone);
    const hash = crypto.createHash("sha256");
    hash.update(canonicalString);
    return hash.digest("hex");
  }
}
