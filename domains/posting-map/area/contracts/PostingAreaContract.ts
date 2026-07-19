export type DistributionStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface PostingAreaSchema {
  readonly areaId: string;
  readonly municipalityCode: string;
  readonly municipalityName: string;
  readonly sheetNumber: number;
  readonly addressRange: string;
  readonly addressCount: number;
  readonly managementNumber: string;
  readonly distributionStatus: DistributionStatus;
  readonly assignee?: string;
  readonly sourceAddresses: readonly string[];
}
