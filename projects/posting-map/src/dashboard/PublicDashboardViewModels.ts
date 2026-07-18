export interface PublicDistrictViewModel {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

export interface PublicMunicipalityViewModel {
  readonly districtId: string;
  readonly name: string;
  readonly historyCount: number;
}

export interface PublicTurnoutViewModel {
  readonly districtId: string;
  readonly municipalityName: string;
  readonly type: "HOUSE_OF_REPRESENTATIVES" | "HOUSE_OF_COUNCILLORS";
  readonly year: number;
  readonly turnout: number;
}

export interface PublicBranchStatusViewModel {
  readonly districtId: string;
  readonly districtName: string;
  readonly provisioningStatus: string;
  readonly activationStatus: string;
  readonly activatedAt: number;
  readonly lineCheck: string;
  readonly gasCheck: string;
}

export interface PublicAssetStatusViewModel {
  readonly districtId: string;
  readonly hasSpreadsheet: boolean;
  readonly hasStorageFolder: boolean;
  readonly hasGasScript: boolean;
}

export interface PublicDashboardDataViewModel {
  readonly metadata: {
    readonly generatedAt: string;
    readonly schemaVersion: string;
    readonly executionId: string;
    readonly presentationHash: string;
    readonly deploymentUrl?: string;
  };
  readonly lineage: {
    readonly sourceHash: string;
    readonly outputHash: string;
  };
  readonly districts: readonly PublicDistrictViewModel[];
  readonly municipalities: readonly PublicMunicipalityViewModel[];
  readonly turnoutComparison: readonly PublicTurnoutViewModel[];
  readonly branchStatus: readonly PublicBranchStatusViewModel[];
  readonly assetStatus: readonly PublicAssetStatusViewModel[];
}
