import * as fs from "fs";

export interface HandoverRecord {
  readonly sprintId: string;
  readonly commitHash: string;
  readonly testsPassed: number;
  readonly testsTotal: number;
  readonly remoteSync: boolean;
  readonly status: "SUCCESS" | "FAILED" | "WARNING" | "BLOCKED";
}

export class HandoverGenerator {
  /**
   * Appends a fixed-format Sprint completion block to the HANDOVER.md file.
   */
  public static update(filePath: string, record: HandoverRecord): void {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Handover file not found at: ${filePath}`);
    }

    const recordBlock = [
      "",
      "## Sprint Completion Record",
      "",
      `Sprint: ${record.sprintId}`,
      `Commit: ${record.commitHash}`,
      `Tests: ${record.testsPassed}/${record.testsTotal} passed`,
      `Remote: ${record.remoteSync ? "SYNCED" : "UNSYNCED"}`,
      `Status: ${record.status}`,
      ""
    ].join("\n");

    fs.appendFileSync(filePath, recordBlock, "utf-8");
  }
}
