import { PostingAreaSchema, DistributionStatus } from "../contracts/PostingAreaContract";
import { deepFreeze } from "../../../election/storage/models/ElectionDashboardStorage";

export class PostingArea implements PostingAreaSchema {
  public readonly areaId: string;
  public readonly municipalityCode: string;
  public readonly municipalityName: string;
  public readonly sheetNumber: number;
  public readonly addressRange: string;
  public readonly addressCount: number;
  public readonly managementNumber: string;
  public readonly distributionStatus: DistributionStatus;
  public readonly assignee?: string;
  public readonly sourceAddresses: readonly string[];

  constructor(data: PostingAreaSchema) {
    this.areaId = data.areaId;
    this.municipalityCode = data.municipalityCode;
    this.municipalityName = data.municipalityName;
    this.sheetNumber = data.sheetNumber;
    this.addressRange = data.addressRange;
    this.addressCount = data.addressCount;
    this.managementNumber = data.managementNumber;
    this.distributionStatus = data.distributionStatus;
    this.assignee = data.assignee;
    
    // Deep clone sourceAddresses to block mutable leakage
    this.sourceAddresses = JSON.parse(JSON.stringify(data.sourceAddresses));

    // Freeze recursively
    deepFreeze(this);
  }

  /**
   * Serializes the area instance into JSON string.
   */
  public toJSON(): string {
    return JSON.stringify({
      areaId: this.areaId,
      municipalityCode: this.municipalityCode,
      municipalityName: this.municipalityName,
      sheetNumber: this.sheetNumber,
      addressRange: this.addressRange,
      addressCount: this.addressCount,
      managementNumber: this.managementNumber,
      distributionStatus: this.distributionStatus,
      assignee: this.assignee,
      sourceAddresses: this.sourceAddresses
    });
  }
}
export { deepFreeze };
