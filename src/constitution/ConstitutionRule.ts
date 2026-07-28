/**
 * ConstitutionRule.ts
 * 
 * Defines granular governance rules associated with Constitution Principles.
 */

export type RuleSeverity = 'MUST' | 'SHOULD' | 'MAY';
export type RuleTarget = 'AI_EMPLOYEE' | 'PROJECT_BRIDGE' | 'WORKFLOW_ENGINE' | 'KNOWLEDGE_REGISTRY';

export interface ConstitutionRule {
  readonly id: string;
  readonly principleId: string;
  readonly target: RuleTarget;
  readonly severity: RuleSeverity;
  readonly ruleName: string;
  readonly description: string;
}

export const STANDARD_RULES: readonly ConstitutionRule[] = Object.freeze([
  Object.freeze({
    id: 'RULE_DISPATCH_001',
    principleId: 'PRIN_001',
    target: 'AI_EMPLOYEE',
    severity: 'MUST',
    ruleName: 'MandatoryArtifactReturn',
    description: 'AI Employees must deliver all outputs directly to the requesting project boundary.'
  }),
  Object.freeze({
    id: 'RULE_OWNERSHIP_001',
    principleId: 'PRIN_002',
    target: 'PROJECT_BRIDGE',
    severity: 'MUST',
    ruleName: 'ProjectExclusiveOwnership',
    description: 'Project Bridge must enforce that artifact ownership remains strictly assigned to the project ID.'
  }),
  Object.freeze({
    id: 'RULE_BOUNDARY_001',
    principleId: 'PRIN_003',
    target: 'KNOWLEDGE_REGISTRY',
    severity: 'MUST',
    ruleName: 'RestrictedKnowledgeRetention',
    description: 'Knowledge Registry must refuse registration of project raw data, source code, or secrets.'
  }),
  Object.freeze({
    id: 'RULE_RETENTION_001',
    principleId: 'PRIN_004',
    target: 'AI_EMPLOYEE',
    severity: 'MUST',
    ruleName: 'ZeroPlatformStateRetention',
    description: 'AI Employees must wipe transient project runtime state upon task completion.'
  }),
  Object.freeze({
    id: 'RULE_SANITIZATION_001',
    principleId: 'PRIN_005',
    target: 'KNOWLEDGE_REGISTRY',
    severity: 'MUST',
    ruleName: 'MandatorySanitizationCheck',
    description: 'Knowledge items must undergo sanitization policy verification prior to platform indexing.'
  }),
  Object.freeze({
    id: 'RULE_AUTONOMY_001',
    principleId: 'PRIN_006',
    target: 'WORKFLOW_ENGINE',
    severity: 'MUST',
    ruleName: 'NonInterferenceWithBusinessLogic',
    description: 'Workflow execution shall not override or mutate requesting project domain business rules.'
  })
]);
