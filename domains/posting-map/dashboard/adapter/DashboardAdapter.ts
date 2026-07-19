import { DashboardViewModel, MunicipalityTurnout, MapFeatureReference } from "../contracts/DashboardViewModel";

export class DashboardAdapter {
  /**
   * Adapts the raw JSON models loaded from files to build the unified DashboardViewModel.
   * Enforces the No Calculation Policy on colors/turnouts; maps raw metrics directly.
   */
  public adapt(
    districtId: string,
    districtName: string,
    dashboardData: any, // ElectionDashboardStorageSchema
    areasData: any[], // PostingAreaSchema[]
    visualizationData: any // MapVisualizationProjectionSchema (optional)
  ): DashboardViewModel {
    // 1. Election statistics mapping
    const nationalTurnout = dashboardData.data.nationalTurnout;
    const districtTurnout = dashboardData.data.districts?.[0]?.turnout ?? 0.0;

    // 2. Area progress aggregation
    const total = areasData.length;
    const completed = areasData.filter(a => a.status === "COMPLETED").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 3. Municipalities turnout mappings
    const municipalities: MunicipalityTurnout[] = (dashboardData.data.municipalities ?? []).map((m: any) => ({
      name: m.name,
      turnout: m.turnout,
      colorStatus: m.colorStatus
    }));

    // 4. Map feature mappings
    let mapFeatures: MapFeatureReference[] = [];
    if (visualizationData && visualizationData.municipalities) {
      mapFeatures = visualizationData.municipalities.map((f: any) => ({
        municipalityCode: f.municipalityCode,
        geometryId: f.geometryId,
        fillColor: f.fillColor // Direct Mapping preservation
      }));
    } else {
      // Graceful fallback mapping (preserves existing color preservation contract)
      mapFeatures = (dashboardData.data.municipalities ?? []).map((m: any) => ({
        municipalityCode: m.code,
        geometryId: `geom-${m.code}`,
        fillColor: m.colorStatus
      }));
    }

    return {
      districtId,
      districtName,
      election: {
        nationalTurnout,
        districtTurnout
      },
      areaSummary: {
        total,
        completed,
        progress
      },
      municipalities: Object.freeze(municipalities),
      mapFeatures: Object.freeze(mapFeatures),
      generatedAt: new Date().toISOString(),
      contentHash: "COMPUTED"
    };
  }
}
