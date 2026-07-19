import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface SecurityConfiguration extends RuntimeConfiguration {
  readonly enforceStrictZeroTrust: boolean;
  readonly defaultTrustLevel: string;
}

export interface SecurityManifest extends RuntimeManifest {
  readonly securityId: string;
  readonly configuration: SecurityConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
