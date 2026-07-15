import { LiveMonitor } from '../monitor/LiveMonitor';
import { LearningSourceRegistry } from '../learning/source/LearningSourceRegistry';
import { LearningSourceResolver } from '../learning/source/LearningSourceResolver';

export interface IObservabilityOS {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  health(): Promise<any>;
  version(): any;
  monitor(): LiveMonitor;
  learningSource(): {
    readonly registry: LearningSourceRegistry;
    readonly resolver: LearningSourceResolver;
  };
}
