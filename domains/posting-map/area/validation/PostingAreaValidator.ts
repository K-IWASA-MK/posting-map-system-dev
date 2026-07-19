import { PostingAreaSchema, DistributionStatus } from "../contracts/PostingAreaContract";
import { AreaMasterSchema } from "../contracts/AreaMasterContract";
import { ElectionMasterSchema } from "../../../election/master/contracts/ElectionMasterContract";

export class PostingAreaValidator {
  /**
   * Checks the validity of a transition between two distribution statuses.
   */
  public validateTransition(
    oldStatus: DistributionStatus,
    newStatus: DistributionStatus
  ): { success: boolean; error?: string } {
    if (oldStatus === newStatus) {
      return { success: true };
    }

    if (oldStatus === "COMPLETED") {
      return {
        success: false,
        error: `Invalid transition: Area is already COMPLETED and cannot transition to '${newStatus}'.`
      };
    }

    if (oldStatus === "UNASSIGNED") {
      if (newStatus !== "ASSIGNED") {
        return {
          success: false,
          error: `Invalid transition: UNASSIGNED area must be assigned first (transition to 'ASSIGNED'), got: '${newStatus}'.`
        };
      }
    }

    if (oldStatus === "ASSIGNED") {
      if (newStatus !== "UNASSIGNED" && newStatus !== "IN_PROGRESS") {
        return {
          success: false,
          error: `Invalid transition: ASSIGNED area can only transition to 'UNASSIGNED' or 'IN_PROGRESS', got: '${newStatus}'.`
        };
      }
    }

    if (oldStatus === "IN_PROGRESS") {
      if (newStatus !== "ASSIGNED" && newStatus !== "COMPLETED") {
        return {
          success: false,
          error: `Invalid transition: IN_PROGRESS area can only transition to 'ASSIGNED' or 'COMPLETED', got: '${newStatus}'.`
        };
      }
    }

    return { success: true };
  }

  /**
   * Validates a single PostingArea schema.
   */
  public validateArea(area: PostingAreaSchema): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!area) {
      return { success: false, errors: ["Area object is null or undefined."] };
    }

    if (!area.areaId || typeof area.areaId !== "string" || area.areaId.trim() === "") {
      errors.push("Area ID is missing or empty.");
    }

    if (!area.municipalityCode || typeof area.municipalityCode !== "string" || area.municipalityCode.trim() === "") {
      errors.push("municipalityCode is missing or empty.");
    }

    if (!area.municipalityName || typeof area.municipalityName !== "string" || area.municipalityName.trim() === "") {
      errors.push("municipalityName is missing or empty.");
    }

    if (area.sheetNumber === undefined || area.sheetNumber <= 0 || !Number.isInteger(area.sheetNumber)) {
      errors.push(`sheetNumber must be a positive integer, got: ${area.sheetNumber}`);
    }

    if (!area.addressRange || typeof area.addressRange !== "string" || area.addressRange.trim() === "") {
      errors.push("addressRange is missing or empty.");
    }

    if (area.addressCount === undefined || area.addressCount <= 0 || !Number.isInteger(area.addressCount)) {
      errors.push(`addressCount must be a positive integer, got: ${area.addressCount}`);
    }

    if (!area.managementNumber || typeof area.managementNumber !== "string" || area.managementNumber.trim() === "") {
      errors.push("managementNumber is missing or empty.");
    }

    if (area.distributionStatus !== "UNASSIGNED" && area.distributionStatus !== "ASSIGNED" && area.distributionStatus !== "IN_PROGRESS" && area.distributionStatus !== "COMPLETED") {
      errors.push(`distributionStatus is invalid, got: '${area.distributionStatus}'`);
    }

    if (!area.sourceAddresses || !Array.isArray(area.sourceAddresses) || area.sourceAddresses.length === 0) {
      errors.push("sourceAddresses list is missing, empty or invalid.");
    } else if (area.sourceAddresses.length !== area.addressCount) {
      errors.push(`sourceAddresses count (${area.sourceAddresses.length}) does not match addressCount (${area.addressCount}).`);
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Validates the entire AreaMaster dataset, checking duplicate codes, integrity and district membership.
   */
  public validateMaster(
    master: AreaMasterSchema,
    electionMaster?: ElectionMasterSchema
  ): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!master) {
      return { success: false, errors: ["AreaMaster is null or undefined."] };
    }

    if (!master.masterId || typeof master.masterId !== "string" || master.masterId.trim() === "") {
      errors.push("AreaMaster masterId is missing or empty.");
    }

    if (!master.districtId || typeof master.districtId !== "string" || master.districtId.trim() === "") {
      errors.push("AreaMaster districtId is missing or empty.");
    }

    if (!master.electionId || typeof master.electionId !== "string" || master.electionId.trim() === "") {
      errors.push("AreaMaster electionId is missing or empty.");
    }

    if (!master.areas || !Array.isArray(master.areas)) {
      errors.push("AreaMaster areas list is missing or invalid.");
      return { success: false, errors };
    }

    const seenAreaIds = new Set<string>();

    for (let i = 0; i < master.areas.length; i++) {
      const area = master.areas[i];
      const areaVal = this.validateArea(area);
      
      if (!areaVal.success) {
        errors.push(...areaVal.errors.map(e => `Area at index ${i}: ${e}`));
      } else {
        if (seenAreaIds.has(area.areaId)) {
          errors.push(`Duplicate areaId detected: '${area.areaId}'`);
        }
        seenAreaIds.add(area.areaId);

        // Validate district membership alignment
        if (electionMaster) {
          const match = electionMaster.municipalities.find(m => m.municipalityCode === area.municipalityCode);
          if (!match) {
            errors.push(`District Integrity Violation: municipalityCode '${area.municipalityCode}' does not exist in the election master.`);
          } else if (match.districtId !== master.districtId) {
            errors.push(`District Integrity Violation: municipality '${area.municipalityName}' (${area.municipalityCode}) belongs to district '${match.districtId}', not the master's district '${master.districtId}'.`);
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
