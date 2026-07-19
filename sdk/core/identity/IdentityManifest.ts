import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface IdentityConfiguration extends RuntimeConfiguration {
  readonly enableSignatureChecks: boolean;
  readonly defaultNamespace: string;
}

export interface IdentityManifest extends RuntimeManifest {
  readonly identityId: string;
  readonly configuration: IdentityConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
