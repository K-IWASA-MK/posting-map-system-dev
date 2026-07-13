import { RuntimeCapability } from './RuntimeCapability';

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
}
