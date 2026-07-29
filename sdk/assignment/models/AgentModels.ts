/**
 * AgentModels.ts
 * 
 * AIOS Task Dispatcher Agent Domain Models
 * Model-agnostic AgentProfile and unified CapabilityType definitions.
 */

export type CapabilityType =
  | 'TYPESCRIPT'
  | 'PYTHON'
  | 'ARCHITECTURE'
  | 'TESTING'
  | 'SECURITY'
  | 'GIT'
  | 'DOCUMENTATION'
  | 'BROWSER_AUTOMATION'
  | 'FILE_SYSTEM'
  | 'AUDIT_LOG_READER'
  | 'STATIC_ANALYSIS';

export interface AgentProfile {
  readonly agentId: string;
  readonly agentName: string;
  readonly provider: string;
  readonly supportedRoles: ReadonlyArray<string>;
  readonly capabilities: ReadonlyArray<CapabilityType>;
  readonly priorityWeight: number;
  readonly metadata?: Record<string, any>;
}
