import { TaskPriority } from '../gateway/models/TaskGatewayModels';
import { RuntimeType } from '../runtime/RuntimeType';

export type AdapterType = 'LEGACY_CONTRACT_ADAPTER' | 'NATIVE_ADAPTER' | 'NONE';

/**
 * DispatchDecision.ts
 * 
 * Immutable representation of the routing decision determined by the Execution Dispatcher.
 */
export interface DispatchDecision {
  readonly runtimeType: RuntimeType;
  readonly adapterType: AdapterType;
  readonly executionType: string;
  readonly priority: TaskPriority;
  readonly reason: string;
}
