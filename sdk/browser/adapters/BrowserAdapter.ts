import { BrowserCapability } from '../types/BrowserCapability';
import { BrowserRuntimeState } from '../types/BrowserRuntimeState';
import { RuntimeEvidenceModel } from '../types/RuntimeEvidenceModel';
import { BrowserSessionModel } from '../types/BrowserSessionModel';

export interface BrowserAdapter {
  attach(cdpEndpoint?: string): Promise<boolean>;
  disconnect(): Promise<void>;
  open(url: string): Promise<boolean>;
  reload(): Promise<boolean>;
  currentPageUrl(): string;
  capabilities(): BrowserCapability[];
  state(): BrowserRuntimeState;
  healthScore(): number;
  sessionState(): BrowserSessionModel;
  captureEvidence(executionId: string): Promise<RuntimeEvidenceModel>;
}
