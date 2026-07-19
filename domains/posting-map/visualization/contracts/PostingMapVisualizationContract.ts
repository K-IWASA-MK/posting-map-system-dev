export interface MunicipalityMapProjection {
  readonly municipalityCode: string;
  readonly municipalityName: string;
  readonly districtId: string;
  readonly turnout: number;
  readonly difference: number;
  readonly colorStatus: "GREEN" | "YELLOW" | "RED";
  readonly fillColor: "GREEN" | "YELLOW" | "RED";
  readonly geometryId: string;
}

export interface VisualizationMetadata {
  readonly sourceContentHash: string;
  readonly visualizationHash: string;
  readonly generatedAt: string;
}

export interface MapVisualizationProjectionSchema {
  readonly projectionId: string;
  readonly electionId: string;
  readonly generatedAt: string;
  readonly metadata: VisualizationMetadata;
  readonly municipalities: readonly MunicipalityMapProjection[];
}

export type VisualizationEventType =
  | "POSTING_MAP_VISUALIZATION_UPDATED"
  | "POSTING_MAP_VISUALIZATION_FAILED";

export interface VisualizationEvent {
  readonly type: VisualizationEventType;
  readonly projectionId: string;
  readonly electionId: string;
  readonly municipalityCount: number;
  readonly hash: string;
  readonly timestamp: number;
  readonly error?: string;
}
