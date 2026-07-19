import { RawDistrictData, RawMunicipality } from "./contracts/DistrictDataAcquisitionContract";
import * as crypto from "crypto";

export class DistrictDataValidator {
  /**
   * Calculates order-independent sourceHash of municipality records.
   */
  public calculateSourceHash(municipalities: readonly RawMunicipality[]): string {
    const rawString = JSON.stringify(municipalities);
    return crypto.createHash("sha256").update(rawString).digest("hex");
  }

  /**
   * Validates RawDistrictData schema and constraints.
   */
  public validate(data: RawDistrictData): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.districtId || !/^[a-z0-9-]+$/.test(data.districtId)) {
      errors.push(`Validation Error: districtId '${data.districtId}' has invalid format.`);
    }
    if (!data.districtName || data.districtName.trim() === "") {
      errors.push("Validation Error: districtName is missing or empty.");
    }
    if (!data.prefecture || data.prefecture.trim() === "") {
      errors.push("Validation Error: prefecture is missing or empty.");
    }
    if (!data.districtNumber || !/^\d+$/.test(data.districtNumber)) {
      errors.push(`Validation Error: districtNumber '${data.districtNumber}' has invalid format.`);
    }

    if (!data.municipalities || data.municipalities.length === 0) {
      errors.push("Validation Error: municipalities list must contain at least one entry.");
    } else {
      for (let i = 0; i < data.municipalities.length; i++) {
        const m = data.municipalities[i];
        if (!m.code || !/^\d{5}$/.test(m.code)) {
          errors.push(`Validation Error: municipalities[${i}] has invalid code '${m.code}'.`);
        }
        if (!m.name || m.name.trim() === "") {
          errors.push(`Validation Error: municipalities[${i}] has missing name.`);
        }
      }
    }

    // Verify sourceHash
    if (data.municipalities && data.municipalities.length > 0) {
      const computedHash = this.calculateSourceHash(data.municipalities);
      if (data.sourceHash !== computedHash) {
        errors.push("Validation Error: sourceHash mismatch.");
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
