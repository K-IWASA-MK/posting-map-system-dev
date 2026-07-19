export interface TurnoutDistrictProjection {
  readonly districtId: string;
  readonly districtName: string;
  readonly turnout: number;
  readonly nationalTurnout: number;
  readonly difference: number;
  readonly status: "GREEN" | "YELLOW" | "RED";
}

export interface TurnoutMunicipalityProjection {
  readonly municipalityCode: string;
  readonly municipalityName: string;
  readonly districtId: string;
  readonly turnout: number;
  readonly national: number;
  readonly difference: number;
  readonly status: "GREEN" | "YELLOW" | "RED";
}

export interface ProjectionLineage {
  readonly source: "ElectionMaster";
  readonly classification: "TurnoutClassification";
  readonly generatedAt: string;
  readonly hash: string;
}

export interface TurnoutDashboardProjectionSchema {
  readonly electionId: string;
  readonly electionType: string;
  readonly electionDate: string;
  readonly nationalTurnout: number;
  readonly districts: readonly TurnoutDistrictProjection[];
  readonly municipalities: readonly TurnoutMunicipalityProjection[];
  readonly lineage: ProjectionLineage;
}
