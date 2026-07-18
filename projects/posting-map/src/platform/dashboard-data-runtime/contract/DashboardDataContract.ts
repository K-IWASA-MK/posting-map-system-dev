export interface DistrictView {
  id: string;
  name: string;
  status: string;
}

export interface MunicipalityView {
  districtId: string;
  name: string;
  historyCount: number;
}

export interface TurnoutView {
  districtId: string;
  municipalityName: string;
  type: string;
  year: number;
  turnout: number;
}

export interface BranchStatusView {
  districtId: string;
  districtName: string;
  provisioningStatus: string;
  activationStatus: string;
  activatedAt: number;
  lineCheck: string;
  gasCheck: string;
}

export interface AssetStatusView {
  districtId: string;
  spreadsheetId: string;
  storageFolderId: string;
  scriptId: string;
  webAppUrl: string;
  inRegistry: boolean;
}

export interface DashboardDataContract {
  metadata: {
    generatedAt: string;
    runtimeVersion: string;
    sourceHash: string;
    executionId: string;
    schemaVersion: string;
  };
  lineage: {
    sources: string[];
    sourceHash: string;
    outputHash: string;
  };
  districts: DistrictView[];
  municipalities: MunicipalityView[];
  turnoutComparison: TurnoutView[];
  branchStatus: BranchStatusView[];
  assetStatus: AssetStatusView[];
}

export const CURRENT_SCHEMA_VERSION = "v1";

export interface DashboardDataEvent {
  type: string;
  missionId: string;
  districtName: string;
}

export interface DashboardDataCompletedEvent {
  type: string;
  missionId: string;
  districtName: string;
  outputFile: string;
  checksum: string;
}

