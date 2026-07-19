export interface MunicipalityReference {
  readonly municipalityCode: string;
  readonly municipalityName: string;
}

export interface DistrictMasterSchema {
  readonly districtId: string;
  readonly districtName: string;
  readonly prefecture: string;
  readonly districtNumber: string;
  readonly masterVersion: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly municipalities: readonly MunicipalityReference[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sourceHash: string;
  readonly contentHash: string;
}

export type DistrictMasterEventType =
  | "DISTRICT_MASTER_CREATED"
  | "DISTRICT_MASTER_UPDATED"
  | "DISTRICT_MASTER_FAILED";

export interface DistrictMasterEvent {
  readonly type: DistrictMasterEventType;
  readonly districtId: string;
  readonly districtName: string;
  readonly timestamp: number;
  readonly error?: string;
}
