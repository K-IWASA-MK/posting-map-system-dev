export interface DistrictViewModel {
  readonly id: string;
  readonly name: string;
  readonly turnout: number;
  readonly difference: number;
  readonly colorStatus: "GREEN" | "YELLOW" | "RED";
}

export interface MunicipalityViewModel {
  readonly code: string;
  readonly name: string;
  readonly districtId: string;
  readonly turnout: number;
  readonly national: number;
  readonly difference: number;
  readonly colorStatus: "GREEN" | "YELLOW" | "RED";
}

export interface ElectionTurnoutViewModel {
  readonly sourceType: "TURNOUT_DASHBOARD_PROJECTION";
  readonly electionId: string;
  readonly electionDate: string;
  readonly nationalTurnout: number;
  readonly districts: readonly DistrictViewModel[];
  readonly municipalities: readonly MunicipalityViewModel[];
  readonly lineageHash: string;
  readonly lastUpdated: string;
}
