import { DevelopmentContext } from '../context/DevelopmentContext';
import { DevelopmentPluginMetadata } from './DevelopmentPluginMetadata';
import { DevelopmentPluginStatus } from './DevelopmentPluginStatus';
import { DevelopmentPluginResult } from './DevelopmentPluginResult';

export interface IDevelopmentPlugin {
  readonly metadata: DevelopmentPluginMetadata;
  readonly status: DevelopmentPluginStatus;

  supports(context: DevelopmentContext): boolean;

  initialize(context: DevelopmentContext): Promise<void>;
  beforeValidate(context: DevelopmentContext): Promise<void>;
  validate(context: DevelopmentContext): Promise<void>;
  afterValidate(context: DevelopmentContext): Promise<void>;
  review(context: DevelopmentContext): Promise<void>;
  govern(context: DevelopmentContext): Promise<void>;
  report(context: DevelopmentContext): Promise<DevelopmentPluginResult>;
  dispose(): Promise<void>;
}
