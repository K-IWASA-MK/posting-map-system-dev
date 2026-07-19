import * as crypto from "crypto";
import { MapVisualizationProjectionSchema } from "../contracts/PostingMapVisualizationContract";

export class VisualizationProjectionValidator {
  /**
   * Validates the integrity, schema types, duplicate codes, color definitions,
   * geo binding completeness, and cryptographic hashes of a MapVisualizationProjection.
   */
  public validate(
    projection: MapVisualizationProjectionSchema,
    expectedSourceHash?: string
  ): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Mandatory schema check
    if (!projection) {
      return { success: false, errors: ["Validation Error: projection object is null or undefined."] };
    }
    if (!projection.projectionId || typeof projection.projectionId !== "string" || projection.projectionId.trim() === "") {
      errors.push("Validation Error: projectionId is missing or empty.");
    }
    if (!projection.electionId || typeof projection.electionId !== "string" || projection.electionId.trim() === "") {
      errors.push("Validation Error: electionId is missing or empty.");
    }
    if (!projection.generatedAt || isNaN(Date.parse(projection.generatedAt))) {
      errors.push("Validation Error: generatedAt is missing or invalid date string.");
    }

    // 2. Metadata check
    if (!projection.metadata) {
      errors.push("Validation Error: metadata object is missing.");
      return { success: false, errors };
    }

    const sha256Regex = /^[a-f0-9]{64}$/i;
    if (!projection.metadata.sourceContentHash || !sha256Regex.test(projection.metadata.sourceContentHash)) {
      errors.push(`Validation Error: sourceContentHash must be a valid SHA-256 hex string, got: '${projection.metadata.sourceContentHash}'`);
    }
    if (!projection.metadata.visualizationHash || !sha256Regex.test(projection.metadata.visualizationHash)) {
      errors.push(`Validation Error: visualizationHash must be a valid SHA-256 hex string, got: '${projection.metadata.visualizationHash}'`);
    }

    // Source Hash Mismatch check
    if (expectedSourceHash && projection.metadata.sourceContentHash !== expectedSourceHash) {
      errors.push(`Validation Error: sourceContentHash mismatch. Expected: '${expectedSourceHash}', Stored: '${projection.metadata.sourceContentHash}'`);
    }

    // 3. Municipalities validation
    if (!projection.municipalities || !Array.isArray(projection.municipalities)) {
      errors.push("Validation Error: municipalities list is missing or invalid.");
    } else {
      const seenCodes = new Set<string>();
      
      for (let i = 0; i < projection.municipalities.length; i++) {
        const m = projection.municipalities[i];
        
        // municipalityCode presence and duplicate check
        if (!m.municipalityCode || typeof m.municipalityCode !== "string" || m.municipalityCode.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a code.`);
        } else {
          if (seenCodes.has(m.municipalityCode)) {
            errors.push(`Validation Error: Duplicate municipalityCode detected: '${m.municipalityCode}'`);
          }
          seenCodes.add(m.municipalityCode);
        }

        if (!m.municipalityName || typeof m.municipalityName !== "string" || m.municipalityName.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a name.`);
        }

        if (!m.districtId || typeof m.districtId !== "string" || m.districtId.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a districtId.`);
        }

        // Color and status integrity checks
        if (m.colorStatus !== "GREEN" && m.colorStatus !== "YELLOW" && m.colorStatus !== "RED") {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} has invalid colorStatus: '${m.colorStatus}'`);
        }
        if (m.fillColor !== "GREEN" && m.fillColor !== "YELLOW" && m.fillColor !== "RED") {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} has invalid fillColor: '${m.fillColor}'`);
        }
        if (m.fillColor !== m.colorStatus) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} fillColor '${m.fillColor}' does not equal colorStatus '${m.colorStatus}'`);
        }

        // Geo Binding Missing Check
        if (!m.geometryId || typeof m.geometryId !== "string" || m.geometryId.trim() === "") {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || m.municipalityName || i} is missing geometryId mapping.`);
        }

        if (m.turnout === undefined || m.turnout === null || isNaN(m.turnout) || m.turnout < 0 || m.turnout > 100) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} turnout is invalid or out of bounds [0, 100]: ${m.turnout}`);
        }
      }
    }

    // 4. Recalculated Hash Verification
    if (projection.metadata.visualizationHash && errors.length === 0) {
      const datasetString = JSON.stringify(projection.municipalities);
      const calculatedHash = crypto
        .createHash("sha256")
        .update(datasetString)
        .digest("hex");

      if (calculatedHash !== projection.metadata.visualizationHash) {
        errors.push(`Validation Error: visualizationHash mismatch. Stored: '${projection.metadata.visualizationHash}', Calculated: '${calculatedHash}'`);
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
