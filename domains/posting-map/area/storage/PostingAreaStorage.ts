import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { PostingAreaSchema } from "../contracts/PostingAreaContract";

export class PostingAreaStorage {
  /**
   * Writes the PostingAreaSchema list to a JSON file atomically using a temporary file.
   * Returns the computed SHA-256 contentHash of the written content.
   */
  public write(filePath: string, areas: readonly PostingAreaSchema[]): string {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const dataString = JSON.stringify(areas, null, 2);
    const contentHash = crypto
      .createHash("sha256")
      .update(dataString)
      .digest("hex");

    const tmpPath = `${filePath}.tmp`;
    
    // Atomic write pattern: write to tmp file then rename
    fs.writeFileSync(tmpPath, dataString, "utf8");
    fs.renameSync(tmpPath, filePath);

    return contentHash;
  }

  /**
   * Reads and parses a PostingAreaSchema list from a JSON file.
   */
  public read(filePath: string): PostingAreaSchema[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Area Storage Error: File not found at path: ${filePath}`);
    }

    const dataString = fs.readFileSync(filePath, "utf8");
    try {
      const parsed = JSON.parse(dataString);
      if (!Array.isArray(parsed)) {
        throw new Error("Area Storage Error: Content is not a valid JSON array.");
      }
      return parsed;
    } catch (err: any) {
      throw new Error(`Area Storage Error: Failed to parse JSON: ${err.message}`);
    }
  }
}
