import { TurnoutDashboardProjectionSchema } from "../contracts/TurnoutDashboardProjectionContract";
import { CLASSIFICATION_THRESHOLD } from "../../classification/rules/TurnoutClassificationRule";

export class ProjectionValidator {
  /**
   * Validates the structural, mathematical and relational consistency of a Dashboard Projection Read Model.
   */
  public validate(p: TurnoutDashboardProjectionSchema): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Required Fields & Schema Integrity
    if (!p.electionId || typeof p.electionId !== "string" || p.electionId.trim() === "") {
      errors.push("Validation Error: electionId must be a non-empty string.");
    }
    if (!p.electionType || typeof p.electionType !== "string" || p.electionType.trim() === "") {
      errors.push("Validation Error: electionType must be a non-empty string.");
    }
    if (!p.electionDate || typeof p.electionDate !== "string" || p.electionDate.trim() === "") {
      errors.push("Validation Error: electionDate must be a non-empty string.");
    }

    if (p.nationalTurnout === undefined || p.nationalTurnout === null || isNaN(p.nationalTurnout)) {
      errors.push("Validation Error: nationalTurnout is missing or invalid.");
    } else if (p.nationalTurnout < 0 || p.nationalTurnout > 100) {
      errors.push(`Validation Error: nationalTurnout out of bounds [0-100]: ${p.nationalTurnout}`);
    }

    // 2. Lineage Integrity Checks
    if (!p.lineage) {
      errors.push("Validation Error: lineage metadata is missing.");
    } else {
      if (p.lineage.source !== "ElectionMaster") {
        errors.push(`Validation Error: lineage source must be 'ElectionMaster', got: '${p.lineage.source}'`);
      }
      if (p.lineage.classification !== "TurnoutClassification") {
        errors.push(`Validation Error: lineage classification must be 'TurnoutClassification', got: '${p.lineage.classification}'`);
      }
      if (!p.lineage.generatedAt || isNaN(Date.parse(p.lineage.generatedAt))) {
        errors.push("Validation Error: lineage generatedAt must be a valid date string.");
      }
      const sha256Regex = /^[a-f0-9]{64}$/i;
      if (!p.lineage.hash || !sha256Regex.test(p.lineage.hash)) {
        errors.push(`Validation Error: lineage hash must be a valid SHA-256 hex string, got: '${p.lineage.hash}'`);
      }
    }

    // 3. District Projections Validation
    const districtIds = new Set<string>();
    if (!p.districts || !Array.isArray(p.districts)) {
      errors.push("Validation Error: districts array is missing or invalid.");
    } else {
      for (let i = 0; i < p.districts.length; i++) {
        const d = p.districts[i];
        if (!d.districtId || typeof d.districtId !== "string" || d.districtId.trim() === "") {
          errors.push(`Validation Error: District at index ${i} is missing a districtId.`);
        } else {
          districtIds.add(d.districtId);
        }

        if (!d.districtName || typeof d.districtName !== "string" || d.districtName.trim() === "") {
          errors.push(`Validation Error: District at index ${i} is missing a districtName.`);
        }

        if (d.turnout === undefined || d.turnout === null || isNaN(d.turnout)) {
          errors.push(`Validation Error: District ${d.districtId || i} is missing a turnout value.`);
        } else if (d.turnout < 0 || d.turnout > 100) {
          errors.push(`Validation Error: District ${d.districtId || i} turnout out of bounds [0-100]: ${d.turnout}`);
        }

        if (d.nationalTurnout !== p.nationalTurnout) {
          errors.push(`Validation Error: District ${d.districtId} nationalTurnout (${d.nationalTurnout}) does not match root nationalTurnout (${p.nationalTurnout}).`);
        }

        // Calculation consistency for District
        const expectedDiff = parseFloat((d.turnout - p.nationalTurnout).toFixed(2));
        if (Math.abs(d.difference - expectedDiff) > 0.01) {
          errors.push(`Validation Error: District ${d.districtId} difference ${d.difference} does not match expected difference ${expectedDiff}.`);
        }

        let expectedStatus: "GREEN" | "YELLOW" | "RED" = "YELLOW";
        if (expectedDiff >= CLASSIFICATION_THRESHOLD.GREEN) {
          expectedStatus = "GREEN";
        } else if (expectedDiff <= CLASSIFICATION_THRESHOLD.RED) {
          expectedStatus = "RED";
        }

        if (d.status !== expectedStatus) {
          errors.push(`Validation Error: District ${d.districtId} status ${d.status} does not match expected status ${expectedStatus}.`);
        }
      }
    }

    // 4. Municipality Projections Validation
    if (!p.municipalities || !Array.isArray(p.municipalities)) {
      errors.push("Validation Error: municipalities array is missing or invalid.");
    } else {
      for (let i = 0; i < p.municipalities.length; i++) {
        const m = p.municipalities[i];
        if (!m.municipalityCode || typeof m.municipalityCode !== "string" || m.municipalityCode.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a municipalityCode.`);
        }

        if (!m.municipalityName || typeof m.municipalityName !== "string" || m.municipalityName.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a municipalityName.`);
        }

        if (!m.districtId || typeof m.districtId !== "string" || m.districtId.trim() === "") {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} is missing a districtId.`);
        } else if (districtIds.size > 0 && !districtIds.has(m.districtId)) {
          // Relational constraint check
          errors.push(`Validation Error: Municipality ${m.municipalityName || i} references districtId '${m.districtId}' which does not exist in districts list.`);
        }

        if (m.turnout === undefined || m.turnout === null || isNaN(m.turnout)) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} is missing a turnout value.`);
        } else if (m.turnout < 0 || m.turnout > 100) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} turnout out of bounds [0-100]: ${m.turnout}`);
        }

        if (m.national !== p.nationalTurnout) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode} national (${m.national}) does not match root nationalTurnout (${p.nationalTurnout}).`);
        }

        // Calculation consistency for Municipality
        const expectedDiff = parseFloat((m.turnout - p.nationalTurnout).toFixed(2));
        if (Math.abs(m.difference - expectedDiff) > 0.01) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode} difference ${m.difference} does not match expected difference ${expectedDiff}.`);
        }

        let expectedStatus: "GREEN" | "YELLOW" | "RED" = "YELLOW";
        if (expectedDiff >= CLASSIFICATION_THRESHOLD.GREEN) {
          expectedStatus = "GREEN";
        } else if (expectedDiff <= CLASSIFICATION_THRESHOLD.RED) {
          expectedStatus = "RED";
        }

        if (m.status !== expectedStatus) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode} status ${m.status} does not match expected status ${expectedStatus}.`);
        }
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
