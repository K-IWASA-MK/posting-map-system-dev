import * as fs from "fs";
import { SchemaValidator } from "../validation/SchemaValidator";
import { OutputHashGenerator } from "../utils/OutputHashGenerator";

export class DashboardDataIntegrityVerifier {
  /**
   * Verifies output file presence, schema structure, sourceHash consistency, and outputHash correctness.
   */
  public static verify(params: {
    outputPath: string;
    expectedSourceHash: string;
    expectedSchemaVersion: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Output existence check
    if (!fs.existsSync(params.outputPath)) {
      errors.push(`Output file does not exist: ${params.outputPath}`);
      return { valid: false, errors };
    }

    let fileContent: string;
    let data: any;
    try {
      fileContent = fs.readFileSync(params.outputPath, "utf-8");
      data = JSON.parse(fileContent);
    } catch (e: any) {
      errors.push(`Failed to read/parse output JSON: ${e.message}`);
      return { valid: false, errors };
    }

    // 2. Schema validation
    const schemaVal = SchemaValidator.validateDashboardData(data);
    if (!schemaVal.valid) {
      errors.push(...schemaVal.errors);
    }

    // 3. sourceHash verification
    if (data.metadata?.sourceHash !== params.expectedSourceHash) {
      errors.push(`Source hash mismatch. Expected: ${params.expectedSourceHash}, Found: ${data.metadata?.sourceHash}`);
    }

    if (data.lineage?.sourceHash !== params.expectedSourceHash) {
      errors.push(`Lineage source hash mismatch. Expected: ${params.expectedSourceHash}, Found: ${data.lineage?.sourceHash}`);
    }

    // 4. outputHash verification (re-computes hash ignoring dynamic variables)
    const recomputedHash = OutputHashGenerator.generate(data);
    if (data.lineage?.outputHash !== recomputedHash) {
      errors.push(`Output hash mismatch. In output file: ${data.lineage?.outputHash}, Recomputed: ${recomputedHash}`);
    }

    // 5. schemaVersion verification
    if (data.metadata?.schemaVersion !== params.expectedSchemaVersion) {
      errors.push(`Schema version mismatch. Expected: ${params.expectedSchemaVersion}, Found: ${data.metadata?.schemaVersion}`);
    }

    return { valid: errors.length === 0, errors };
  }
}
