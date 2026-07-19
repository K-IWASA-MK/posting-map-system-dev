import { DashboardViewModel } from "../contracts/DashboardViewModel";
import * as fs from "fs";
import * as crypto from "crypto";

export class DashboardValidator {
  /**
   * Validates the integrated DashboardViewModel metrics and schemas.
   */
  public validate(model: DashboardViewModel): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Turnout limits (0% to 100%)
    if (model.election.nationalTurnout < 0 || model.election.nationalTurnout > 100) {
      errors.push(`Validation Error: nationalTurnout '${model.election.nationalTurnout}' is out of bounds (0-100).`);
    }
    if (model.election.districtTurnout < 0 || model.election.districtTurnout > 100) {
      errors.push(`Validation Error: districtTurnout '${model.election.districtTurnout}' is out of bounds (0-100).`);
    }

    for (const m of model.municipalities) {
      if (m.turnout < 0 || m.turnout > 100) {
        errors.push(`Validation Error: Municipality '${m.name}' turnout '${m.turnout}' is out of bounds (0-100).`);
      }
    }

    // 2. Area metrics constraints (completed <= total)
    if (model.areaSummary.completed > model.areaSummary.total) {
      errors.push(
        `Validation Error: completed area count '${model.areaSummary.completed}' exceeds total count '${model.areaSummary.total}'.`
      );
    }
    if (model.areaSummary.progress < 0 || model.areaSummary.progress > 100) {
      errors.push(`Validation Error: progress percentage '${model.areaSummary.progress}' is out of bounds (0-100).`);
    }

    // 3. Map feature checks
    for (const f of model.mapFeatures) {
      if (!f.municipalityCode) {
        errors.push("Validation Error: Map feature is missing municipalityCode.");
      }
      if (!f.geometryId || !f.geometryId.startsWith("geom-")) {
        errors.push(`Validation Error: Map feature has invalid geometryId '${f.geometryId}'.`);
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Performs file-level hash integrity verification to ensure files are not tampered with.
   */
  public verifyFileIntegrity(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(fileContent);

      const expectedHash =
        parsed.metadata?.contentHash ??
        parsed.metadata?.areasHash ??
        parsed.metadata?.visualizationHash ??
        parsed.contentHash;

      if (!expectedHash) {
        return true; // No hash to verify
      }

      // Re-serialize content to calculate matching hash
      const dataToHash = parsed.data ?? parsed.areas ?? parsed.municipalities ?? parsed;
      const recalculated = crypto
        .createHash("sha256")
        .update(JSON.stringify(dataToHash))
        .digest("hex");

      return expectedHash === recalculated;
    } catch {
      return false;
    }
  }
}
