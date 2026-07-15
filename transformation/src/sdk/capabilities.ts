import { Command } from '../models/protocol';
import { OSEvent } from '../models/protocol';
import { PluginContext } from './models';

// Capabilities MUST NOT depend on each other.

export interface ExecutableCapability {
  execute(command: Command, context: PluginContext): Promise<readonly OSEvent[]>;
}

export interface ProjectableCapability {
  project(events: readonly OSEvent[], context: PluginContext): Promise<void>;
}

export interface PublishCapability {
  publish(events: readonly OSEvent[], context: PluginContext): Promise<void>;
}

export interface MetricsCapability {
  collectMetrics(context: PluginContext): Promise<Record<string, unknown>>;
}

export interface SecurityCapability {
  validateSecurity(command: Command, context: PluginContext): Promise<boolean>;
}
