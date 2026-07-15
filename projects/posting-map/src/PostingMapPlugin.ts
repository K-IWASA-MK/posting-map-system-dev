import { AIOSPluginBase, IAIOSManifest, IAIOSModule, PluginContext } from '@kiwasa/aios-core';
import manifest from './manifest.json';

export class PostingMapPlugin extends AIOSPluginBase {
  public readonly manifest: IAIOSManifest = manifest as any;

  public override async initialize(context: PluginContext): Promise<void> {
    await super.initialize(context);
    
    // Register domain services and legacy logic
    // this.registerLearning();
    // this.registerKnowledge();
    // this.registerGovernance();
  }
}
