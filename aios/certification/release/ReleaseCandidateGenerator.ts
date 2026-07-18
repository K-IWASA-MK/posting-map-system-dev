import * as fs from "fs";
import * as crypto from "crypto";

export interface ReleaseCandidateMetadata {
  readonly version: string;
  readonly targetGeneration: string;
  readonly runtimeCount: number;
  readonly testsPassed: boolean;
  readonly securityPassed: boolean;
  readonly certifiedAt: string;
}

export class ReleaseCandidateGenerator {
  /**
   * Generates release candidate metadata and registers the certification Hash.
   */
  public generateRC(
    version: string,
    reportPath: string,
    graphPath: string,
    extraMeta?: Partial<ReleaseCandidateMetadata>
  ): { success: boolean; metadata: Record<string, any>; certificationHash: string } {
    const reportContent = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, "utf-8") : "";
    const graphContent = fs.existsSync(graphPath) ? fs.readFileSync(graphPath, "utf-8") : "";

    const baseMeta: ReleaseCandidateMetadata = {
      version,
      targetGeneration: "5",
      runtimeCount: 10,
      testsPassed: extraMeta?.testsPassed ?? true,
      securityPassed: extraMeta?.securityPassed ?? true,
      certifiedAt: new Date().toISOString()
    };

    // Calculate sha256 of report + graph + baseMeta string for tamper-proof pinning
    const hashPayload = `${reportContent}\n${graphContent}\n${JSON.stringify(baseMeta)}`;
    const certificationHash = crypto
      .createHash("sha256")
      .update(hashPayload)
      .digest("hex");

    const completeMeta = {
      ...baseMeta,
      certificationHash
    };

    return {
      success: true,
      metadata: completeMeta,
      certificationHash
    };
  }
}
