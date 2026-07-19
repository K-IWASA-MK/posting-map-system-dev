export interface DistrictDataAcquisitionRequest {
  readonly requestId: string;
  readonly districtName: string;
}

export interface RawMunicipality {
  readonly code: string;
  readonly name: string;
}

export interface RawDistrictData {
  readonly districtId: string;
  readonly districtName: string;
  readonly prefecture: string;
  readonly districtNumber: string;
  readonly municipalities: readonly RawMunicipality[];
  readonly acquiredAt: string;
  readonly sourceHash: string;
  readonly sourceType: string;
}

export type DataAcquisitionEventType =
  | "DISTRICT_DATA_ACQUIRED"
  | "DISTRICT_DATA_ACQUISITION_FAILED";

export interface DataAcquisitionEvent {
  readonly type: DataAcquisitionEventType;
  readonly requestId: string;
  readonly districtName: string;
  readonly timestamp: number;
  readonly error?: string;
}
