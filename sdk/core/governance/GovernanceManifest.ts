import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface GovernanceConfiguration extends RuntimeConfiguration {
  readonly enableComplianceChecks: boolean;
  readonly defaultPolicyScope: string;
}

export interface GovernanceManifest extends RuntimeManifest {
  readonly governanceId: string;
  readonly configuration: GovernanceConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
