import { IAIOSManifest } from './IAIOSManifest';
import { IAIOSLifecycle } from './IAIOSLifecycle';
import { IAIOSModule } from './IAIOSModule';

export interface IAIOSPlugin extends IAIOSLifecycle {
  readonly manifest: IAIOSManifest;
  
  getModule<T extends IAIOSModule>(moduleId: string): T | undefined;
  listModules(): ReadonlyArray<IAIOSModule>;
}
