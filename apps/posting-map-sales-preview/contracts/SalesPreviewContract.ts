export interface TurnoutPreview {
  readonly name: string;
  readonly turnout: number;
  readonly colorStatus: "GREEN" | "YELLOW" | "RED";
}

export interface VisualizationFeature {
  readonly municipalityCode: string;
  readonly geometryId: string;
  readonly colorStatus: "GREEN" | "YELLOW" | "RED";
  readonly fillColor: string;
}

export interface SalesPreviewModel {
  readonly previewId: string;
  readonly traceId: string;
  readonly generatedAt: string;
  readonly districtName: string;
  readonly municipalities: readonly string[];
  readonly areaStatus: "READY" | "PENDING" | "FAILED";
  readonly dashboardStatus: "READY" | "PENDING" | "FAILED";
  readonly visualizationStatus: "READY" | "PENDING" | "FAILED";
  readonly turnoutOverview: readonly TurnoutPreview[];
  readonly visualizationFeatures: readonly VisualizationFeature[];
}
