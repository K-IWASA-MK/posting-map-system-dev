import * as crypto from "crypto";

export class PresentationHashGenerator {
  /**
   * Generates a deterministic SHA-256 hash from the PublicDashboardDataContract content.
   * Excludes metadata.generatedAt, metadata.deploymentUrl, metadata.executionId,
   * and metadata.presentationHash to ensure the hash only reflects static data changes.
   */
  public static generate(data: any): string {
    const clone = JSON.parse(JSON.stringify(data));
    
    if (clone.metadata) {
      clone.metadata.generatedAt = "";
      clone.metadata.deploymentUrl = "";
      clone.metadata.executionId = "";
      clone.metadata.presentationHash = "";
    }

    const canonicalString = JSON.stringify(clone);
    const hash = crypto.createHash("sha256");
    hash.update(canonicalString);
    return hash.digest("hex");
  }
}
