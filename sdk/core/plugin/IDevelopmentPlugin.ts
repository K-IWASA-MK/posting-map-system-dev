import { PluginExecutionContext } from '../engine/PluginExecutionContext';
import { DevelopmentContext } from '../context/DevelopmentContext';
import { DevelopmentPluginMetadata } from './DevelopmentPluginMetadata';
import { DevelopmentPluginStatus } from './DevelopmentPluginStatus';
import { DevelopmentPluginResult } from './DevelopmentPluginResult';

export interface IDevelopmentPlugin {
  readonly metadata: DevelopmentPluginMetadata;
  readonly status: DevelopmentPluginStatus;

  supports(context: DevelopmentContext): boolean;

  initialize(pluginContext: PluginExecutionContext): Promise<void>;
  beforeValidate(pluginContext: PluginExecutionContext): Promise<void>;
  validate(pluginContext: PluginExecutionContext): Promise<void>;
  afterValidate(pluginContext: PluginExecutionContext): Promise<void>;
  review(pluginContext: PluginExecutionContext): Promise<void>;
  govern(pluginContext: PluginExecutionContext): Promise<void>;
  report(pluginContext: PluginExecutionContext): Promise<DevelopmentPluginResult>;
  dispose(): Promise<void>;
}
