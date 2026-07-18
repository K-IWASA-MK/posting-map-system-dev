import { ElectionMasterSchema } from "../contracts/ElectionMasterContract";

export class ElectionMasterValidator {
  private readonly registeredIds: Set<string> = new Set();

  /**
   * Registers an election ID to prevent duplicates.
   */
  public registerElectionId(electionId: string): void {
    this.registeredIds.add(electionId);
  }

  /**
   * Clears the registered election ID store (useful for clean test environments).
   */
  public clearRegistry(): void {
    this.registeredIds.clear();
  }

  /**
   * Validates the schema and data integrity of an ElectionMaster entry.
   */
  public validate(master: ElectionMasterSchema): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Schema / Required Fields Validation
    if (!master.electionId || typeof master.electionId !== "string" || master.electionId.trim() === "") {
      errors.push("Validation Error: electionId must be a non-empty string.");
    }
    if (!master.electionType || typeof master.electionType !== "string" || master.electionType.trim() === "") {
      errors.push("Validation Error: electionType must be a non-empty string.");
    }
    if (!master.electionDate || typeof master.electionDate !== "string" || master.electionDate.trim() === "") {
      errors.push("Validation Error: electionDate must be a non-empty string.");
    }

    // 2. Duplicate Check
    if (master.electionId && this.registeredIds.has(master.electionId)) {
      errors.push(`Validation Error: Duplicate electionId detected: ${master.electionId}`);
    }

    // 3. National Turnout Validation
    if (!master.nationalTurnout) {
      errors.push("Validation Error: nationalTurnout is missing.");
    } else {
      if (master.nationalTurnout.level !== "NATIONAL") {
        errors.push("Validation Error: nationalTurnout level must be 'NATIONAL'.");
      }
      if (
        master.nationalTurnout.turnout === undefined ||
        master.nationalTurnout.turnout === null ||
        isNaN(master.nationalTurnout.turnout)
      ) {
        errors.push("Validation Error: nationalTurnout turnout is missing or invalid.");
      } else if (master.nationalTurnout.turnout < 0 || master.nationalTurnout.turnout > 100) {
        errors.push(`Validation Error: nationalTurnout turnout out of bounds [0-100]: ${master.nationalTurnout.turnout}`);
      }
    }

    // 4. District Turnout Validation
    const districtIds = new Set<string>();
    if (!master.districts || !Array.isArray(master.districts)) {
      errors.push("Validation Error: districts list is missing or invalid.");
    } else {
      for (let i = 0; i < master.districts.length; i++) {
        const d = master.districts[i];
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
      }
    }

    // 5. Municipality Turnout Validation & Relation Integrity
    if (!master.municipalities || !Array.isArray(master.municipalities)) {
      errors.push("Validation Error: municipalities list is missing or invalid.");
    } else {
      for (let i = 0; i < master.municipalities.length; i++) {
        const m = master.municipalities[i];
        if (!m.municipalityCode || typeof m.municipalityCode !== "string" || m.municipalityCode.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a municipalityCode.`);
        }

        if (!m.municipalityName || typeof m.municipalityName !== "string" || m.municipalityName.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a municipalityName.`);
        }

        if (!m.districtId || typeof m.districtId !== "string" || m.districtId.trim() === "") {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} is missing a districtId.`);
        } else if (districtIds.size > 0 && !districtIds.has(m.districtId)) {
          // ID Relation Integrity Check
          errors.push(
            `Validation Error: Municipality ${m.municipalityName || i} refers to districtId '${m.districtId}' which does not exist in districts.`
          );
        }

        if (m.turnout === undefined || m.turnout === null || isNaN(m.turnout)) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} is missing a turnout value.`);
        } else if (m.turnout < 0 || m.turnout > 100) {
          errors.push(`Validation Error: Municipality ${m.municipalityCode || i} turnout out of bounds [0-100]: ${m.turnout}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
