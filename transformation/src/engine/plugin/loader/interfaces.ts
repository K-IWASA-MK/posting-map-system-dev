import { PluginContext } from './models';
import { IPlugin } from '../../../models/plugin';

/**
 * IPluginActivator abstracts the physical allocation and initialization of a sandbox.
 */
export interface IPluginActivator {
  /**
   * Phase 1: Archive extraction, manifest parsing, sandbox generation.
   */
  prepare(context: PluginContext, archiveData: Uint8Array): Promise<void>;

  /**
   * Phase 2: Start execution (instantiation within the sandbox).
   */
  activate(context: PluginContext): Promise<IPlugin>;

  /**
   * Phase 3: Memory release and sandbox destruction.
   */
  dispose(context: PluginContext): Promise<void>;
}
