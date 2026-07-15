import { ILearningSourceResolver } from '../source';
import { LearningFactory, LearningOSComponents } from './LearningFactory';
import { LearningRuntime } from './LearningRuntime';
import { LearningOSState } from './LearningOSState';
import { LearningVersion } from './LearningVersion';

export class LearningBootstrap {
  public static async boot(resolver: ILearningSourceResolver): Promise<{ runtime: LearningRuntime, components: LearningOSComponents, version: LearningVersion }> {
    const runtime = new LearningRuntime(); // starts in BOOTING
    
    try {
      // Create components synchronously for now, but could be async if DB connection is needed
      const components = LearningFactory.createComponents(resolver);
      
      const version: LearningVersion = {
        version: '1.0.0',
        sprint: '9',
        build: 'S9-8',
        schemaVersion: '1.0.0'
      };

      runtime.transitionTo(LearningOSState.READY);

      return { runtime, components, version };
    } catch (err: any) {
      runtime.transitionTo(LearningOSState.ERROR, err.message);
      throw err;
    }
  }
}
