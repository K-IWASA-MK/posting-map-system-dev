import { BrowserSessionModel } from './BrowserSessionModel';

export interface RuntimeEvidenceModel {
  executionId: string;
  timestamp: string;
  url: string;
  browserVersion: string;
  profileName: string;
  screenshotRef: string;
  consoleLogs: Array<{ level: string; message: string; timestamp: string }>;
  networkLogs: Array<{ requestId: string; url: string; method: string; status: number; durationMs: number }>;
  domSnapshot: {
    title: string;
    bodyHash: string;
    hudStatusMap: Record<string, string>;
  };
  trace: {
    eventCount: number;
    traceHash: string;
  };
  sessionState: BrowserSessionModel;
}
