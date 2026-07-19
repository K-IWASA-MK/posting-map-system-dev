import { IRuntime } from '../IRuntime';
import { RuntimeHealth } from '../RuntimeHealth';
import { RuntimeState } from '../RuntimeState';
import { RuntimeDescriptor } from '../RuntimeDescriptor';

export interface IRuntimeService {
  register(runtime: IRuntime, runtimeType?: string): Promise<void>;
  deregister(runtimeId: string): Promise<void>;
  resolve(runtimeId: string): IRuntime;
  getState(runtimeId: string): RuntimeState;
  getHealth(runtimeId: string): Promise<RuntimeHealth>;
  initializeRuntime(runtimeId: string): Promise<void>;
  startRuntime(runtimeId: string): Promise<void>;
  stopRuntime(runtimeId: string): Promise<void>;
  activateRuntime(runtimeId: string): Promise<void>;
  deactivateRuntime(runtimeId: string): Promise<void>;
}
