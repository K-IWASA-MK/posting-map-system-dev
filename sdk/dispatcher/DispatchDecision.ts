import { TaskPriority } from '../gateway/models/TaskGatewayModels';

export type DispatchTarget = 'LEGACY_RUNTIME' | 'NATIVE_RUNTIME' | 'EXTERNAL_RUNTIME';
export type AdapterType = 'LEGACY_CONTRACT_ADAPTER' | 'NATIVE_ADAPTER' | 'NONE';

/**
 * DispatchDecision.ts
 * 
 * Immutable representation of the routing decision determined by the Execution Dispatcher.
 */
export interface DispatchDecision {
  readonly dispatchTarget: DispatchTarget;
  readonly adapterType: AdapterType;
  readonly executionType: string;
  readonly priority: TaskPriority;
  readonly reason: string;
}
