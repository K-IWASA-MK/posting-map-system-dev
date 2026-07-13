export enum PredictionEventType {
  PredictionRequested = "PredictionRequested",
  HistoryCollected = "HistoryCollected",
  TrendsAnalyzed = "TrendsAnalyzed",
  PredictionGenerated = "PredictionGenerated",
  PredictionValidated = "PredictionValidated",
  PredictionAccepted = "PredictionAccepted",
  PredictionRejected = "PredictionRejected",
  PredictionCompleted = "PredictionCompleted",
  PredictionArchived = "PredictionArchived"
}

export interface PredictionEvent {
  type: PredictionEventType;
  traceId: string;
  timestamp: number;
  payload: any;
}

export interface PredictionEventBus {
  publish(event: PredictionEvent): void;
  subscribe(type: PredictionEventType, handler: (event: PredictionEvent) => void): void;
}
