import { CoordinationRecord } from "./CoordinationRecord";
import { CoordinationInstruction } from "./CoordinationInstruction";
import { ConsensusResult } from "./ConsensusEngine";
import { DelegationPlan } from "./DelegationPlan";
import { RuntimeResponse } from "./RuntimeResponse";

export interface CoordinationLedger {
  appendCoordination(record: CoordinationRecord): void;
}

export interface DecisionLedger {
  appendDecision(decision: any): void;
}

export interface InstructionLedger {
  appendInstruction(instruction: CoordinationInstruction): void;
}

export interface ConsensusLedger {
  appendConsensus(consensus: ConsensusResult): void;
}

export interface DelegationLedger {
  appendDelegation(delegation: DelegationPlan): void;
}

export interface QueryLedger {
  appendQueryResponse(response: RuntimeResponse): void;
}

export interface AuditLedger {
  appendAudit(tag: string, traceId: string, payload: any): void;
}
