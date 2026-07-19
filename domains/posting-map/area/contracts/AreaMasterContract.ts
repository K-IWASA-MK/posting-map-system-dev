import { PostingAreaSchema } from "./PostingAreaContract";

export interface AreaMasterSchema {
  readonly masterId: string;
  readonly districtId: string;
  readonly electionId: string;
  readonly generatedAt: string;
  readonly areas: readonly PostingAreaSchema[];
  readonly sourceHash: string;
  readonly contentHash: string;
}

export type AreaMasterEventType =
  | "POSTING_AREA_CREATED"
  | "POSTING_AREA_UPDATED"
  | "POSTING_AREA_FAILED";

export interface AreaMasterEvent {
  readonly type: AreaMasterEventType;
  readonly masterId: string;
  readonly districtId: string;
  readonly areaCount: number;
  readonly hash: string;
  readonly timestamp: number;
  readonly error?: string;
}
