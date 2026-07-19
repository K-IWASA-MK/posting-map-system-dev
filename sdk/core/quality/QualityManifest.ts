import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface QualityConfiguration extends RuntimeConfiguration {
  readonly minPassingOverallScore: number;
  readonly minPassingHealthScore: number;
  readonly minPassingStabilityScore: number;
}

export interface QualityManifest extends RuntimeManifest {
  readonly qualityId: string;
  readonly configuration: QualityConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
