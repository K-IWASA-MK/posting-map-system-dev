import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { DistrictMasterSchema } from "../contracts/DistrictMasterContract";

export class DistrictMasterRepository {
  /**
   * Reads DistrictMaster list from JSON registry file.
   */
  public read(filePath: string): readonly DistrictMasterSchema[] {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.trim() === "") {
        return [];
      }
      return JSON.parse(content);
    } catch (err) {
      console.error("[DistrictMasterRepository] Read failed:", err);
      return [];
    }
  }

  /**
   * Writes DistrictMaster list atomically to JSON registry file.
   * Calculations contentHash on data.
   */
  public write(filePath: string, data: readonly DistrictMasterSchema[]): string {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonString = JSON.stringify(data, null, 2);
    const tmpPath = `${filePath}.tmp`;
    
    fs.writeFileSync(tmpPath, jsonString, "utf-8");
    fs.renameSync(tmpPath, filePath);

    // Calculate final file content hash
    const finalContent = fs.readFileSync(filePath, "utf-8");
    return crypto
      .createHash("sha256")
      .update(finalContent)
      .digest("hex");
  }
}
