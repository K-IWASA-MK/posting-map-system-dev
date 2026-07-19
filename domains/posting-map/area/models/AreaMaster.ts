import { AreaMasterSchema } from "../contracts/AreaMasterContract";
import { PostingAreaSchema } from "../contracts/PostingAreaContract";
import { deepFreeze } from "../../../election/storage/models/ElectionDashboardStorage";

export class AreaMaster implements AreaMasterSchema {
  public readonly masterId: string;
  public readonly districtId: string;
  public readonly electionId: string;
  public readonly generatedAt: string;
  public readonly areas: readonly PostingAreaSchema[];
  public readonly sourceHash: string;
  public readonly contentHash: string;

  constructor(data: AreaMasterSchema) {
    this.masterId = data.masterId;
    this.districtId = data.districtId;
    this.electionId = data.electionId;
    this.generatedAt = data.generatedAt;
    this.sourceHash = data.sourceHash;
    this.contentHash = data.contentHash;

    // Deep clone areas list to block reference leak
    this.areas = JSON.parse(JSON.stringify(data.areas));

    // Freeze master structure and sub-objects
    deepFreeze(this);
  }

  /**
   * Serializes the entire AreaMaster dataset into JSON string.
   */
  public toJSON(): string {
    return JSON.stringify({
      masterId: this.masterId,
      districtId: this.districtId,
      electionId: this.electionId,
      generatedAt: this.generatedAt,
      areas: this.areas,
      sourceHash: this.sourceHash,
      contentHash: this.contentHash
    });
  }
}
