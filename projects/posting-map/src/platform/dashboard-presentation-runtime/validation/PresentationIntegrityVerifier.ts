import * as fs from "fs";
import { PresentationHashGenerator } from "../utils/PresentationHashGenerator";
import { PUBLIC_SCHEMA_VERSION } from "../contract/PresentationContract";

export class PresentationIntegrityVerifier {
  /**
   * Verifies the presentation file existence, schemaVersion, presentationHash, outputHash alignment, and lineage fields.
   */
  public static verify(params: {
    outputPath: string;
    expectedOutputHash: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. File existence check
    if (!fs.existsSync(params.outputPath)) {
      errors.push(`Public file does not exist: ${params.outputPath}`);
      return { valid: false, errors };
    }

    let fileContent: string;
    let data: any;
    try {
      fileContent = fs.readFileSync(params.outputPath, "utf-8");
      data = JSON.parse(fileContent);
    } catch (e: any) {
      errors.push(`Failed to read/parse public JSON: ${e.message}`);
      return { valid: false, errors };
    }

    // 2. Schema version check
    if (data.metadata?.schemaVersion !== PUBLIC_SCHEMA_VERSION) {
      errors.push(`Schema version mismatch. Expected: ${PUBLIC_SCHEMA_VERSION}, Found: ${data.metadata?.schemaVersion}`);
    }

    // 3. Lineage existence check
    if (!data.lineage) {
      errors.push("Lineage metadata object is missing.");
    } else {
      // 4. outputHash connection check
      if (data.lineage.outputHash !== params.expectedOutputHash) {
        errors.push(`Lineage outputHash mismatch. Expected: ${params.expectedOutputHash}, Found: ${data.lineage.outputHash}`);
      }
      if (!data.lineage.sourceHash) {
        errors.push("Lineage sourceHash is missing.");
      }
    }

    // 5. presentationHash check
    if (!data.metadata?.presentationHash) {
      errors.push("presentationHash metadata is missing.");
    } else {
      const recomputedHash = PresentationHashGenerator.generate(data);
      if (data.metadata.presentationHash !== recomputedHash) {
        errors.push(`Presentation hash mismatch. In file: ${data.metadata.presentationHash}, Recomputed: ${recomputedHash}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
