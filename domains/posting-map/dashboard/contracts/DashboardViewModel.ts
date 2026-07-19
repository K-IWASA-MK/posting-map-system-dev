export interface MunicipalityTurnout {
  readonly name: string;
  readonly turnout: number;
  readonly colorStatus: "GREEN" | "YELLOW" | "RED";
}

export interface MapFeatureReference {
  readonly municipalityCode: string;
  readonly geometryId: string;
  readonly fillColor: string;
}

export interface DashboardViewModel {
  readonly districtId: string;
  readonly districtName: string;
  readonly election: {
    readonly nationalTurnout: number;
    readonly districtTurnout: number;
  };
  readonly areaSummary: {
    readonly total: number;
    readonly completed: number;
    readonly progress: number; // 0-100 progress percentage
  };
  readonly municipalities: readonly MunicipalityTurnout[];
  readonly mapFeatures: readonly MapFeatureReference[];
  readonly generatedAt: string;
  readonly contentHash: string;
}
