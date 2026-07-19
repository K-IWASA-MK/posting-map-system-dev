export interface DashboardViewQuery {
  readonly districtName: string;
  readonly baseDir: string;
}

export type DashboardRuntimeEventType =
  | "DASHBOARD_VIEW_LOADED"
  | "DASHBOARD_VIEW_FAILED";

export interface DashboardRuntimeEvent {
  readonly type: DashboardRuntimeEventType;
  readonly districtName: string;
  readonly timestamp: number;
  readonly error?: string;
}
