import * as fs from "fs";
import { ElectionDashboardStorage } from "../models/ElectionDashboardStorage";
import { DashboardStorageValidator } from "../validation/DashboardStorageValidator";

export class ElectionDashboardStorageReader {
  private readonly validator: DashboardStorageValidator;

  constructor() {
    this.validator = new DashboardStorageValidator();
  }

  /**
   * Reads, parses, validates, and restores an ElectionDashboardStorage model from file.
   * Blocks and throws on schema mismatch, out of bounds values, or hash mismatch.
   */
  public read(filePath: string): ElectionDashboardStorage {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Storage Reader Error: File not found at path: ${filePath}`);
    }

    const jsonContent = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(jsonContent);

    // Validate overall storage structure & content hash
    const validationResult = this.validator.validate(parsed);
    if (!validationResult.success) {
      throw new Error(`Storage Reader Error: Validation failed: ${validationResult.errors.join("; ")}`);
    }

    // Restore frozen model
    return new ElectionDashboardStorage(
      parsed.storageId,
      parsed.version,
      parsed.electionId,
      parsed.metadata,
      parsed.data
    );
  }
}
