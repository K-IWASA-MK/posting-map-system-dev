import { DistrictMasterSchema } from "../contracts/DistrictMasterContract";
import * as crypto from "crypto";

export class DistrictMasterValidator {
  /**
   * Helper to calculate the sourceHash of a raw municipality list.
   */
  public calculateSourceHash(municipalities: readonly { municipalityCode: string; municipalityName: string }[]): string {
    const rawString = JSON.stringify(municipalities);
    return crypto.createHash("sha256").update(rawString).digest("hex");
  }

  /**
   * Validates a DistrictMasterSchema object.
   * Ensures non-emptiness, municipality references, hash consistency, and version tags.
   */
  public validate(master: DistrictMasterSchema): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!master.districtId || master.districtId.trim() === "") {
      errors.push("Validation Error: districtId is missing or empty.");
    }
    if (!master.districtName || master.districtName.trim() === "") {
      errors.push("Validation Error: districtName is missing or empty.");
    }
    if (!master.prefecture || master.prefecture.trim() === "") {
      errors.push("Validation Error: prefecture is missing or empty.");
    }
    if (!master.districtNumber || master.districtNumber.trim() === "") {
      errors.push("Validation Error: districtNumber is missing or empty.");
    }
    if (!master.masterVersion || master.masterVersion.trim() === "") {
      errors.push("Validation Error: masterVersion is missing or empty.");
    }
    if (!master.effectiveFrom || master.effectiveFrom.trim() === "") {
      errors.push("Validation Error: effectiveFrom date is missing or empty.");
    }

    if (!master.municipalities || master.municipalities.length === 0) {
      errors.push("Validation Error: municipalities list must contain at least one municipality.");
    } else {
      for (let i = 0; i < master.municipalities.length; i++) {
        const m = master.municipalities[i];
        if (!m.municipalityCode || m.municipalityCode.trim() === "") {
          errors.push(`Validation Error: municipalities[${i}] has missing or empty municipalityCode.`);
        }
        if (!m.municipalityName || m.municipalityName.trim() === "") {
          errors.push(`Validation Error: municipalities[${i}] has missing or empty municipalityName.`);
        }
      }
    }

    // Verify sourceHash
    if (master.municipalities && master.municipalities.length > 0) {
      const computedSourceHash = this.calculateSourceHash(master.municipalities);
      if (master.sourceHash !== computedSourceHash) {
        errors.push("Validation Error: sourceHash mismatch. Municipality list integrity check failed.");
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Validates duplicate restrictions on the registry list.
   */
  public validateRegistry(list: readonly DistrictMasterSchema[]): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    const ids = new Set<string>();
    const names = new Set<string>();

    for (const d of list) {
      if (ids.has(d.districtId)) {
        errors.push(`Validation Error: Duplicate districtId registration found: '${d.districtId}'.`);
      }
      if (names.has(d.districtName)) {
        errors.push(`Validation Error: Duplicate districtName registration found: '${d.districtName}'.`);
      }
      ids.add(d.districtId);
      names.add(d.districtName);
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
