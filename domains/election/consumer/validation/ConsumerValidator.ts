import { ElectionTurnoutViewModel } from "../contracts/ElectionDashboardConsumerContract";

export class ConsumerValidator {
  /**
   * Validates the structures, type safety, and lineage attributes of the bindable UI ViewModel.
   */
  public validate(vm: ElectionTurnoutViewModel): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Source Type verification
    if (vm.sourceType !== "TURNOUT_DASHBOARD_PROJECTION") {
      errors.push(`Validation Error: sourceType must be 'TURNOUT_DASHBOARD_PROJECTION', got: '${vm.sourceType}'`);
    }

    // 2. Schema and structure verification
    if (!vm.electionId || typeof vm.electionId !== "string" || vm.electionId.trim() === "") {
      errors.push("Validation Error: electionId is missing or empty.");
    }
    if (!vm.electionDate || typeof vm.electionDate !== "string" || vm.electionDate.trim() === "") {
      errors.push("Validation Error: electionDate is missing or empty.");
    }

    if (vm.nationalTurnout === undefined || vm.nationalTurnout === null || isNaN(vm.nationalTurnout)) {
      errors.push("Validation Error: nationalTurnout is missing or invalid.");
    } else if (vm.nationalTurnout < 0 || vm.nationalTurnout > 100) {
      errors.push(`Validation Error: nationalTurnout out of bounds [0-100]: ${vm.nationalTurnout}`);
    }

    // 3. Lineage verification (lineageHash and lastUpdated mandatory)
    const sha256Regex = /^[a-f0-9]{64}$/i;
    if (!vm.lineageHash || typeof vm.lineageHash !== "string" || vm.lineageHash.trim() === "") {
      errors.push("Validation Error: lineageHash is missing or empty.");
    } else if (!sha256Regex.test(vm.lineageHash)) {
      errors.push(`Validation Error: lineageHash must be a valid SHA-256 hex string, got: '${vm.lineageHash}'`);
    }

    if (!vm.lastUpdated || typeof vm.lastUpdated !== "string" || vm.lastUpdated.trim() === "" || isNaN(Date.parse(vm.lastUpdated))) {
      errors.push("Validation Error: lastUpdated is missing or is an invalid date string.");
    }

    // 4. District ViewModels check
    const districtIds = new Set<string>();
    if (!vm.districts || !Array.isArray(vm.districts)) {
      errors.push("Validation Error: districts array is missing or invalid.");
    } else {
      for (let i = 0; i < vm.districts.length; i++) {
        const d = vm.districts[i];
        if (!d.id || typeof d.id !== "string" || d.id.trim() === "") {
          errors.push(`Validation Error: District at index ${i} is missing an id.`);
        } else {
          districtIds.add(d.id);
        }

        if (!d.name || typeof d.name !== "string" || d.name.trim() === "") {
          errors.push(`Validation Error: District at index ${i} is missing a name.`);
        }

        if (d.turnout === undefined || d.turnout === null || isNaN(d.turnout)) {
          errors.push(`Validation Error: District ${d.id || i} is missing a turnout value.`);
        } else if (d.turnout < 0 || d.turnout > 100) {
          errors.push(`Validation Error: District ${d.id || i} turnout out of bounds [0-100]: ${d.turnout}`);
        }

        if (d.colorStatus !== "GREEN" && d.colorStatus !== "YELLOW" && d.colorStatus !== "RED") {
          errors.push(`Validation Error: District ${d.id || i} has an invalid colorStatus: '${d.colorStatus}'`);
        }
      }
    }

    // 5. Municipality ViewModels check
    if (!vm.municipalities || !Array.isArray(vm.municipalities)) {
      errors.push("Validation Error: municipalities array is missing or invalid.");
    } else {
      for (let i = 0; i < vm.municipalities.length; i++) {
        const m = vm.municipalities[i];
        if (!m.code || typeof m.code !== "string" || m.code.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a code.`);
        }

        if (!m.name || typeof m.name !== "string" || m.name.trim() === "") {
          errors.push(`Validation Error: Municipality at index ${i} is missing a name.`);
        }

        if (!m.districtId || typeof m.districtId !== "string" || m.districtId.trim() === "") {
          errors.push(`Validation Error: Municipality ${m.code || i} is missing a districtId.`);
        } else if (districtIds.size > 0 && !districtIds.has(m.districtId)) {
          errors.push(`Validation Error: Municipality ${m.name || i} references districtId '${m.districtId}' which does not exist in districts list.`);
        }

        if (m.turnout === undefined || m.turnout === null || isNaN(m.turnout)) {
          errors.push(`Validation Error: Municipality ${m.code || i} is missing a turnout value.`);
        } else if (m.turnout < 0 || m.turnout > 100) {
          errors.push(`Validation Error: Municipality ${m.code || i} turnout out of bounds [0-100]: ${m.turnout}`);
        }

        if (m.colorStatus !== "GREEN" && m.colorStatus !== "YELLOW" && m.colorStatus !== "RED") {
          errors.push(`Validation Error: Municipality ${m.code || i} has an invalid colorStatus: '${m.colorStatus}'`);
        }
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
