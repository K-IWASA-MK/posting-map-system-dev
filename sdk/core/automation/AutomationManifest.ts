import { RuntimeManifest } from '../runtime/RuntimeManifest';
import { RuntimeConfiguration } from '../runtime/RuntimeConfiguration';
import { RuntimePolicy } from '../runtime/RuntimePolicy';

export interface ActionRuleConfig {
  readonly actionName: string;
  readonly cooldownMs: number;
  readonly maxRetries: number;
}

export interface AutomationConfiguration extends RuntimeConfiguration {
  readonly rules: ActionRuleConfig[];
}

export interface AutomationManifest extends RuntimeManifest {
  readonly automationId: string;
  readonly configuration: AutomationConfiguration;
  readonly lifecyclePolicy: RuntimePolicy;
}
