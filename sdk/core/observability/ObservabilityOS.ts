import { IObservabilityOS } from './IObservabilityOS';
import { LiveMonitor } from '../monitor/LiveMonitor';
import { LearningSourceRegistry } from '../learning/source/LearningSourceRegistry';
import { LearningSourceResolver } from '../learning/source/LearningSourceResolver';
import { ObservabilityBootstrap } from './bootstrap/ObservabilityBootstrap';
import { ObservabilityHealthProvider } from './bootstrap/ObservabilityHealthProvider';
import { ObservabilityVersionProvider } from './bootstrap/ObservabilityVersionProvider';

export class ObservabilityOS implements IObservabilityOS {
  private bootstrapService: ObservabilityBootstrap;
  private healthProvider: ObservabilityHealthProvider;
  private versionProvider: ObservabilityVersionProvider;

  constructor(
    bootstrapService: ObservabilityBootstrap,
    healthProvider: ObservabilityHealthProvider,
    versionProvider: ObservabilityVersionProvider
  ) {
    this.bootstrapService = bootstrapService;
    this.healthProvider = healthProvider;
    this.versionProvider = versionProvider;
  }

  public async initialize(): Promise<void> {
    await this.bootstrapService.initialize();
  }

  public async shutdown(): Promise<void> {
    await this.bootstrapService.shutdown();
  }

  public async health(): Promise<any> {
    return this.healthProvider.getHealth();
  }

  public version(): any {
    return this.versionProvider.getVersion();
  }

  public monitor(): LiveMonitor {
    const runtime = this.bootstrapService.getRuntime();
    if (!runtime) {
      throw new Error('Runtime Error: ObservabilityOS is not initialized');
    }
    return runtime.liveMonitor;
  }

  public learningSource(): {
    readonly registry: LearningSourceRegistry;
    readonly resolver: LearningSourceResolver;
  } {
    const runtime = this.bootstrapService.getRuntime();
    if (!runtime) {
      throw new Error('Runtime Error: ObservabilityOS is not initialized');
    }
    return {
      registry: runtime.learningRegistry,
      resolver: runtime.learningResolver
    };
  }
}
