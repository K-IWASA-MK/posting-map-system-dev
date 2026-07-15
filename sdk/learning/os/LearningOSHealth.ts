import { LearningOSState } from './LearningOSState';
import { LearningVersion } from './LearningVersion';

export interface LearningOSHealth {
  readonly state: LearningOSState;
  readonly uptimeMs: number;
  readonly loadedPlugins: number;
  readonly loadedPolicies: number;
  readonly version: LearningVersion;
  readonly lastError?: string;
}
