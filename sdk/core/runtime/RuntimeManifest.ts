import { RuntimeCapability } from './RuntimeCapability';
import { RuntimeDependency } from './RuntimeDescriptor';
import { RuntimeConfiguration } from './RuntimeConfiguration';
import { RuntimePolicy } from './RuntimePolicy';

export interface RuntimeManifest {
  manifestVersion: string;
  runtimeId: string;
  runtimeName: string;
  runtimeVersion: string;
  contractVersion: string;
  capabilities: RuntimeCapability[];
  dependencies: RuntimeDependency[];
  configuration: RuntimeConfiguration;
  lifecyclePolicy: RuntimePolicy;
}
