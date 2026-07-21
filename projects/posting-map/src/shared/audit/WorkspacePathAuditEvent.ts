export type WorkspacePathEventType =
  | 'RESOLVER_CALLED'
  | 'VALIDATION_STARTED'
  | 'VALIDATION_PASSED'
  | 'VALIDATION_FAILED'
  | 'RULE_VIOLATION_DETECTED';

export interface WorkspacePathAuditEvent {
  readonly eventId: string;
  readonly timestamp: string;
  readonly componentName: string;
  readonly eventType: WorkspacePathEventType;
  readonly targetPath?: string;
  readonly resolverMethod?: string;
  readonly validationResult?: 'PASS' | 'WARNING' | 'FAIL';
  readonly violatedRuleId?: string;
  readonly executionContext?: Record<string, any>;
}
