import { IPlugin, PluginDescriptor } from '../models/plugin';
import { SdkDescriptor, PluginContext } from './models';

/**
 * PluginBase
 * 
 * Abstract base class for all Transformation OS plugins.
 * Encapsulates the immutable PluginDescriptor, SdkDescriptor, and Plugin Hooks.
 */
export abstract class PluginBase implements IPlugin {
  
  constructor(
    public readonly descriptor: PluginDescriptor,
    public readonly sdkDescriptor: SdkDescriptor
  ) {
    if (!descriptor || !descriptor.manifest) {
      throw new Error("PluginDescriptor with valid manifest is required.");
    }
  }

  // --- Hooks (Empty default implementations) ---

  async beforeExecute(context: PluginContext): Promise<void> {
    // Default: do nothing
  }

  async afterExecute(context: PluginContext): Promise<void> {
    // Default: do nothing
  }

  async onError(error: Error, context: PluginContext): Promise<void> {
    // Default: do nothing
  }

  async dispose(): Promise<void> {
    // Default: do nothing
  }
}
