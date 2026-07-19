import { RuntimeCapability } from './RuntimeCapability';
import { RuntimeState } from './RuntimeState';

export interface RuntimeDependency {
  runtimeId: string;
  version: string;
  required: boolean;
}

export interface RuntimeDescriptor {
  runtimeId: string;
  runtimeName: string;
  version: string;
  contractVersion: string;
  capabilities: RuntimeCapability[];
  dependencies: RuntimeDependency[];
  metadata?: Record<string, unknown>;

  // Phase 4 additions
  runtimeType?: string;
  runtimeVersion?: string;
  runtimeCapabilities?: RuntimeCapability[];
  runtimeDependencies?: RuntimeDependency[];
  runtimePriority?: number;
  runtimeState?: RuntimeState;
}
