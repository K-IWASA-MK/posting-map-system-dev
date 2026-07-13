import { PredictionResultRecord } from "./PredictionResultRecord";

export interface PredictionLedger {
  appendPrediction(record: PredictionResultRecord): void;
}

export interface ConfidenceLedger {
  appendConfidenceScore(traceId: string, score: number): void;
}

export interface ModelLedger {
  appendModelUsage(modelName: string, traceId: string): void;
}

export interface HistoryLedger {
  appendHistory(payload: any): void;
}

export interface AuditLedger {
  appendAudit(tag: string, traceId: string, payload: any): void;
}
