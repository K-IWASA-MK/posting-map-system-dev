/**
 * WorkflowProfile.ts
 * 
 * AIOS Task Gateway Workflow Profile Domain Models (v1.1)
 * Formal contract representing execution workflow stages, output policies, and completion policies.
 * 
 * Extensibility Note:
 * WorkflowDefinition -> WorkflowProfile structure allows future extension for custom profiles
 * (e.g. HOTFIX, INCIDENT, EMERGENCY with omitted PLAN or added POST_MORTEM stages).
 */

export type WorkflowType =
  | 'STANDARD_DEVELOPMENT'
  | 'RESEARCH'
  | 'REVIEW'
  | 'AUDIT'
  | 'HOTFIX'
  | 'PLANNING'
  | 'QUESTION'
  | 'DOCUMENTATION';

export type WorkflowStage =
  | 'PLAN'
  | 'REVIEW'
  | 'PROCEED'
  | 'IMPLEMENTATION'
  | 'VERIFICATION'
  | 'GIT_COMMIT'
  | 'GIT_PUSH'
  | 'WALKTHROUGH'
  | 'HANDOVER'
  | 'CLOSE'
  | 'CLOSED'
  | 'CEO_APPROVAL'
  | 'DESIGN'
  | 'AUDIT_CHECK'
  | 'INVESTIGATION';

export interface WorkflowOutputPolicy {
  readonly language: string;               // e.g. 'ja'
  readonly codeLanguage: string;           // e.g. 'en'
  readonly documentationLanguage: string;  // e.g. 'ja'
}

export interface CompletionPolicy {
  readonly requireVerification: boolean;
  readonly requireGitCommit: boolean;
  readonly requireGitPush: boolean;
  readonly requireWalkthrough: boolean;
  readonly requireHandover: boolean;
}

export interface WorkflowProfile {
  readonly workflowType: WorkflowType;
  readonly stages: ReadonlyArray<WorkflowStage>;
  readonly outputPolicy: WorkflowOutputPolicy;
  readonly completionPolicy: CompletionPolicy;
}
