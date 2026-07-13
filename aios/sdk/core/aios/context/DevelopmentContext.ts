import { DevelopmentContextType } from './DevelopmentContextType';
import { DevelopmentExecutionMode } from './DevelopmentExecutionMode';
import { DevelopmentContextStatus } from './DevelopmentContextStatus';

export interface DevelopmentContext {
  readonly contextId: string;
  readonly contextVersion: string;
  readonly contextType: DevelopmentContextType;
  readonly status: DevelopmentContextStatus;
  readonly executionMode: DevelopmentExecutionMode;
  readonly targetPaths: readonly string[];
  readonly changedFiles: readonly string[];
  readonly project: string;
  readonly pluginScope: readonly string[];
  readonly reviewerScope: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}
