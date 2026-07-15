import { IAIOSPlugin } from '../contracts/IAIOSPlugin';
import { IAIOSManifest } from '../contracts/IAIOSManifest';
import { IAIOSModule } from '../contracts/IAIOSModule';
import { PluginContext } from '../contracts/PluginContext';

/**
 * AIOSPluginBase
 * 
 * Abstract base class for all AIOS platform plugins.
 * Provides default empty implementations for lifecycle methods.
 */
export abstract class AIOSPluginBase implements IAIOSPlugin {
  public abstract readonly manifest: IAIOSManifest;
  protected context?: PluginContext;

  public async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    context.logger.info(`${this.manifest.name} initializing...`);
  }

  public async start(): Promise<void> {
    this.context?.logger.info(`${this.manifest.name} started.`);
  }

  public async suspend(): Promise<void> {
    this.context?.logger.info(`${this.manifest.name} suspended.`);
  }

  public async resume(): Promise<void> {
    this.context?.logger.info(`${this.manifest.name} resumed.`);
  }

  public async stop(): Promise<void> {
    this.context?.logger.info(`${this.manifest.name} stopped.`);
  }

  public getModule<T extends IAIOSModule>(moduleId: string): T | undefined {
    return undefined;
  }

  public listModules(): ReadonlyArray<IAIOSModule> {
    return [];
  }
}
