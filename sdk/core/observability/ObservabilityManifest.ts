import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';
import { AlertRule } from './ObservabilityRecord';

export interface ObservabilityConfiguration extends RuntimeConfiguration {
  metricsIntervalMs?: number;
  logLimit?: number;
  traceLimit?: number;
}

export interface ObservabilityManifest extends RuntimeManifest {
  observabilityId: string;
  configuration: ObservabilityConfiguration;
  lifecyclePolicy: RuntimePolicy;
  rules: AlertRule[];
}
