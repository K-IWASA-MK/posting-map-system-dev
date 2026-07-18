export interface DistrictModel {
  id: string;
  name: string;
  status: string;
}

export interface MunicipalityModel {
  districtId: string;
  name: string;
  historyCount: number;
}

export interface TurnoutComparisonModel {
  districtId: string;
  municipalityName: string;
  type: string;
  year: number;
  turnout: number;
}

export interface BranchStatusModel {
  districtId: string;
  districtName: string;
  provisioningStatus: string;
  activationStatus: string;
  activatedAt: number;
  lineCheck: string;
  gasCheck: string;
}

export interface AssetStatusModel {
  districtId: string;
  spreadsheetId: string;
  storageFolderId: string;
  scriptId: string;
  webAppUrl: string;
  inRegistry: boolean;
}

export interface DashboardDataModel {
  districts: DistrictModel[];
  municipalities: MunicipalityModel[];
  turnoutComparison: TurnoutComparisonModel[];
  branchStatus: BranchStatusModel[];
  assetStatus: AssetStatusModel[];
}
