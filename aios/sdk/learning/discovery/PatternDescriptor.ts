import { LearningPlugin } from './LearningPlugin';
import { PluginStatus } from './PluginStatus';

/**
 * Internal wrapper used by the PatternRegistry to manage plugins.
 * Maintains the registration state and status.
 */
export interface PatternDescriptor {
  readonly plugin: LearningPlugin;
  readonly registeredAt: string; // ISO8601 format
  readonly status: PluginStatus;
}
