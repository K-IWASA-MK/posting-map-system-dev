import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface FederationConfiguration extends RuntimeConfiguration {
  readonly enableCrossDomainAuth: boolean;
  readonly defaultSessionTimeoutMs: number;
}

export interface FederationManifest extends RuntimeManifest {
  readonly federationId: string;
  readonly configuration: FederationConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
