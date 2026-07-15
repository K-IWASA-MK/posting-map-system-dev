import { DevelopmentPluginId } from './DevelopmentPluginId';
import { DevelopmentContextType } from '../context/DevelopmentContextType';
import { DevelopmentCapability } from './DevelopmentCapability';

export interface DevelopmentPluginMetadata {
  readonly id: DevelopmentPluginId | string;
  readonly name: string;
  readonly version: string;
  readonly apiVersion: string;
  readonly description: string;
  readonly author: string;
  readonly priority: number;
  readonly supportedContexts: readonly DevelopmentContextType[];
  readonly capabilities: readonly DevelopmentCapability[];
  readonly dependencies: readonly string[];
}
