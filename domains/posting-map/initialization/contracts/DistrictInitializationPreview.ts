export interface DistrictInitializationPreview {
  readonly district: string;
  readonly municipalities: readonly string[];
  readonly areaStatus: "READY" | "PENDING" | "FAILED";
  readonly dashboardStatus: "READY" | "PENDING" | "FAILED";
  readonly visualizationStatus: "READY" | "PENDING" | "FAILED";
}
