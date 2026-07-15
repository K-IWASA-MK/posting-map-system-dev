import { DevelopmentContext } from '../context/DevelopmentContext';
import { ExecutionSession } from './ExecutionSession';
import { PluginExecutionPlan } from './PluginExecutionPlan';

export interface PluginExecutionContext {
  readonly context: DevelopmentContext;
  readonly session: ExecutionSession;
  readonly plan: PluginExecutionPlan;
  readonly sharedState: Readonly<Record<string, unknown>>;
}
