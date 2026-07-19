import { RawDistrictData } from "./contracts/DistrictDataAcquisitionContract";
import * as fs from "fs";
import * as path from "path";

export class DistrictDataRepository {
  /**
   * Saves raw district data atomically using .tmp rename method.
   */
  public saveRawDistrict(data: RawDistrictData, baseDir: string): string {
    const districtDir = path.join(baseDir, data.districtName);
    if (!fs.existsSync(districtDir)) {
      fs.mkdirSync(districtDir, { recursive: true });
    }

    const targetFile = path.join(districtDir, "raw-district.json");
    const tmpFile = `${targetFile}.tmp`;

    try {
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpFile, targetFile);
      return targetFile;
    } catch (err) {
      if (fs.existsSync(tmpFile)) {
        try {
          fs.unlinkSync(tmpFile);
        } catch {}
      }
      throw err;
    }
  }
}
