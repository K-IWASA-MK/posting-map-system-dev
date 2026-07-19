import { TurnoutClassification } from "../contracts/TurnoutClassificationContract";
import { TurnoutProjection } from "../models/TurnoutProjection";
import { CLASSIFICATION_THRESHOLD } from "../rules/TurnoutClassificationRule";

export class ClassificationValidator {
  /**
   * Validates TurnoutClassification models for range constraints and logic consistency.
   */
  public validateClassification(c: TurnoutClassification): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Turnout existence and range check
    if (c.nationalTurnout === undefined || c.nationalTurnout === null || isNaN(c.nationalTurnout)) {
      errors.push("Validation Error: nationalTurnout is missing or invalid.");
    } else if (c.nationalTurnout < 0 || c.nationalTurnout > 100) {
      errors.push(`Validation Error: nationalTurnout out of bounds [0-100]: ${c.nationalTurnout}`);
    }

    if (c.districtTurnout === undefined || c.districtTurnout === null || isNaN(c.districtTurnout)) {
      errors.push("Validation Error: districtTurnout is missing or invalid.");
    } else if (c.districtTurnout < 0 || c.districtTurnout > 100) {
      errors.push(`Validation Error: districtTurnout out of bounds [0-100]: ${c.districtTurnout}`);
    }

    if (c.municipalityTurnout === undefined || c.municipalityTurnout === null || isNaN(c.municipalityTurnout)) {
      errors.push("Validation Error: municipalityTurnout is missing or invalid.");
    } else if (c.municipalityTurnout < 0 || c.municipalityTurnout > 100) {
      errors.push(`Validation Error: municipalityTurnout out of bounds [0-100]: ${c.municipalityTurnout}`);
    }

    // 2. Logic Consistency check (difference must equal municipality - national)
    const expectedDiff = parseFloat((c.municipalityTurnout - c.nationalTurnout).toFixed(2));
    if (Math.abs(c.difference - expectedDiff) > 0.01) {
      errors.push(
        `Validation Error: difference '${c.difference}' does not match expected difference '${expectedDiff}' (municipality: ${c.municipalityTurnout}, national: ${c.nationalTurnout}).`
      );
    }

    // 3. Classification Match check
    let expectedStatus: "GREEN" | "YELLOW" | "RED" = "YELLOW";
    if (expectedDiff >= CLASSIFICATION_THRESHOLD.GREEN) {
      expectedStatus = "GREEN";
    } else if (expectedDiff <= CLASSIFICATION_THRESHOLD.RED) {
      expectedStatus = "RED";
    }

    if (c.classification !== expectedStatus) {
      errors.push(
        `Validation Error: classification status mismatch. Expected '${expectedStatus}' for difference ${expectedDiff}, found '${c.classification}' for municipalityCode ${c.municipalityCode}.`
      );
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Validates TurnoutProjection models (used on presentation layer).
   */
  public validateProjection(p: TurnoutProjection): { success: boolean; errors: string[] } {
    // Adapter mapping to validate using the same underlying logic
    const mockClassification: TurnoutClassification = {
      municipalityCode: p.municipalityCode,
      municipalityName: p.municipalityName,
      nationalTurnout: p.national,
      districtTurnout: p.turnout, // stubbed for range check
      municipalityTurnout: p.turnout,
      difference: p.difference,
      classification: p.status
    };
    return this.validateClassification(mockClassification);
  }
}
