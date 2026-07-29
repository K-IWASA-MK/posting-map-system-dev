import { DispatchDecision } from './DispatchDecision';

/**
 * DispatchResult.ts
 * 
 * Immutable representation of the final outcome of the Execution Dispatcher.
 */
export interface DispatchResult {
  readonly decision: DispatchDecision;
  readonly matchedRule: string;
  readonly timestamp: string;
  readonly dispatcherVersion: string;
}
