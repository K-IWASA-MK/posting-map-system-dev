export enum EscalationAction {
  WAIT = 'WAIT',
  REASSIGN = 'REASSIGN',
  ESCALATE_TO_SUPERVISOR = 'ESCALATE_TO_SUPERVISOR',
  FAIL = 'FAIL'
}

export interface EscalationPolicy {
  maxStallTimeMs: number;
  actionOnStall: EscalationAction;
}
