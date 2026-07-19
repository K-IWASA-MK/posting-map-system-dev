export interface DistrictInitializationRequest {
  readonly initializationId: string;
  readonly districtId?: string;
  readonly districtName: string;
  readonly requester: string;
  readonly requestedAt: string;
}

export interface DistrictInitializationResult {
  readonly initializationId: string;
  readonly districtName: string;
  readonly status: "REQUESTED" | "PROCESSING" | "READY" | "FAILED";
  readonly resources: readonly string[];
  readonly error?: string;
}

export type InitializationEventType =
  | "POSTING_MAP_INITIALIZATION_STARTED"
  | "POSTING_MAP_DISTRICT_RESOLVED"
  | "POSTING_MAP_AREA_READY"
  | "POSTING_MAP_DASHBOARD_READY"
  | "POSTING_MAP_VISUALIZATION_READY"
  | "POSTING_MAP_INITIALIZATION_COMPLETED"
  | "POSTING_MAP_INITIALIZATION_FAILED";

export interface InitializationEvent {
  readonly type: InitializationEventType;
  readonly initializationId: string;
  readonly districtName: string;
  readonly timestamp: number;
  readonly payload?: any;
  readonly error?: string;
}
