import { ElectionTurnoutViewModel } from "../../consumer/contracts/ElectionDashboardConsumerContract";

export interface StorageMetadata {
  readonly sourceLineageHash: string;
  readonly contentHash: string;
  readonly generatedAt: string;
}

export interface ElectionDashboardStorageSchema {
  readonly storageId: string;
  readonly version: string;
  readonly sourceType: "ELECTION_DASHBOARD_VIEW_MODEL";
  readonly electionId: string;
  readonly metadata: StorageMetadata;
  readonly data: ElectionTurnoutViewModel;
}

export type StorageEventType = "ELECTION_DASHBOARD_STORAGE_UPDATED" | "ELECTION_DASHBOARD_STORAGE_FAILED";

export interface StorageEvent {
  readonly type: StorageEventType;
  readonly storageId: string;
  readonly electionId: string;
  readonly version: string;
  readonly hash?: string;
  readonly timestamp: number;
  readonly error?: string;
}
