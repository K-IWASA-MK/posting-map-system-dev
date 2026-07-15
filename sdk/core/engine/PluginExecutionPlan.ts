import { DevelopmentPluginId } from '../plugin/DevelopmentPluginId';

export interface PluginExecutionPlanNode {
  readonly pluginId: DevelopmentPluginId | string;
  readonly priority: number;
  readonly dependencies: readonly (DevelopmentPluginId | string)[];
}

export interface PluginExecutionPlan {
  readonly planId: string;
  readonly nodes: readonly PluginExecutionPlanNode[];
  readonly createdAt: string;
}
