import { PluginState } from '../../models/plugin';

/**
 * PluginLifecyclePolicy
 * 
 * Enforces the strict State Machine for plugin lifecycles.
 * Permitted flow: DISCOVERED -> REGISTERED -> LOADED -> ACTIVE -> SUSPENDED -> UNLOADED
 * Any other transition is explicitly prohibited.
 */
export class PluginLifecyclePolicy {
  
  private static readonly VALID_TRANSITIONS: Record<PluginState, ReadonlySet<PluginState>> = {
    'DISCOVERED': new Set(['TRUSTED', 'FAILED']),
    'TRUSTED': new Set(['ACTIVATING', 'FAILED']),
    'ACTIVATING': new Set(['ACTIVE', 'FAILED']),
    'ACTIVE': new Set(['SUSPENDED', 'UNLOADED', 'FAILED']),
    'SUSPENDED': new Set(['ACTIVE', 'UNLOADED', 'FAILED']),
    'UNLOADED': new Set([]), // Terminal state
    'FAILED': new Set(['UNLOADED']) // Can be unloaded to clean up
  };

  /**
   * Validates if a transition from currentState to targetState is allowed.
   * Throws an error if the transition is prohibited.
   */
  static validateTransition(currentState: PluginState, targetState: PluginState): void {
    const allowed = this.VALID_TRANSITIONS[currentState];
    
    if (!allowed || !allowed.has(targetState)) {
      throw new Error(`Invalid plugin lifecycle transition: Cannot transition from ${currentState} to ${targetState}`);
    }
  }
}
