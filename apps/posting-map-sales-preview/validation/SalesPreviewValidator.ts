import { SalesPreviewModel } from "../contracts/SalesPreviewContract";
import * as fs from "fs";
import * as crypto from "crypto";

export class SalesPreviewValidator {
  /**
   * Validates the generated SalesPreviewModel.
   * Performs schema checks, source file integrity checks (hash validations),
   * and validates that the model is deeply frozen and read-only.
   */
  public validate(model: SalesPreviewModel, dashboardFilePath: string): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Schema check
    if (!model.previewId || model.previewId.trim() === "") {
      errors.push("Validation Error: previewId is missing or empty.");
    }
    if (!model.traceId || model.traceId.trim() === "") {
      errors.push("Validation Error: traceId is missing or empty.");
    }
    if (!model.districtName || model.districtName.trim() === "") {
      errors.push("Validation Error: districtName is missing or empty.");
    }
    if (!model.municipalities || model.municipalities.length === 0) {
      errors.push("Validation Error: municipalities list is empty.");
    }

    // 2. Read Only validation (Object must be frozen)
    if (!Object.isFrozen(model)) {
      errors.push("Validation Error: SalesPreviewModel must be deeply frozen.");
    }
    if (model.municipalities && !Object.isFrozen(model.municipalities)) {
      errors.push("Validation Error: municipalities list must be deeply frozen.");
    }
    if (model.turnoutOverview && !Object.isFrozen(model.turnoutOverview)) {
      errors.push("Validation Error: turnoutOverview list must be deeply frozen.");
    }
    if (model.visualizationFeatures && !Object.isFrozen(model.visualizationFeatures)) {
      errors.push("Validation Error: visualizationFeatures list must be deeply frozen.");
    }

    // 3. Source Integrity Check
    if (fs.existsSync(dashboardFilePath)) {
      try {
        const fileContent = fs.readFileSync(dashboardFilePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        const expectedHash = parsed.metadata?.contentHash;
        
        // Re-calculate hash of the parsed data to ensure it matches
        const recalculated = crypto
          .createHash("sha256")
          .update(JSON.stringify(parsed.data))
          .digest("hex");

        if (expectedHash && expectedHash !== recalculated) {
          errors.push("Validation Error: Dashboard read model file has been tampered with (contentHash mismatch).");
        }
      } catch (err: any) {
        errors.push(`Validation Error: Source integrity check failed to parse file: ${err.message}`);
      }
    }

    // 4. Feature specific validation
    for (let i = 0; i < model.visualizationFeatures.length; i++) {
      const f = model.visualizationFeatures[i];
      if (!f.municipalityCode) {
        errors.push(`Validation Error: visualizationFeatures[${i}] has missing municipalityCode.`);
      }
      if (!f.geometryId) {
        errors.push(`Validation Error: visualizationFeatures[${i}] has missing geometryId.`);
      }
      if (f.colorStatus !== f.fillColor) {
        errors.push(`Validation Error: fillColor '${f.fillColor}' does not match colorStatus '${f.colorStatus}'.`);
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
