import { RuntimeContext } from './RuntimeContext';
import { RuntimeDescriptor } from './RuntimeDescriptor';
import { RuntimeManifest } from './RuntimeManifest';
import { RuntimeHealth } from './RuntimeHealth';

export interface IRuntime<TManifest = any, TResult = any> {
  readonly descriptor: RuntimeDescriptor;
  readonly manifest?: RuntimeManifest;
  
  getHealth(): Promise<RuntimeHealth>;

  initialize(context: RuntimeContext): Promise<void>;
  validate(manifest: TManifest): Promise<void>;
  execute(manifest: TManifest): Promise<TResult>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  shutdown(): Promise<void>;

  // Phase 4 Runtime Service additions
  readonly id?: string;
  readonly version?: string;
  readonly dependsOn?: string[];
  start?(): Promise<void>;
  stop?(): Promise<void>;
  health?(): RuntimeHealth;
}
