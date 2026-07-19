import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';
import { ServiceDependency, ServiceIdentity } from './ServiceModels';

export interface ServiceConfiguration extends RuntimeConfiguration {
  readonly maxConcurrency: number;
}

export interface ServiceManifest extends RuntimeManifest {
  readonly serviceIdentity: ServiceIdentity;
  readonly serviceDependencies: ServiceDependency[];
  readonly configuration: ServiceConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
