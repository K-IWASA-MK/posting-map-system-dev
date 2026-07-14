import { IWorker } from '../../models/runtime_ports';
import { Command, OSEvent } from '../../models/protocol';
import { ExecutionAttempt } from '../../models/kernel';
import { IPlugin } from '../../models/plugin';
import { PluginContext } from '../plugin/loader/models';
import { ExecutionSession, ExecutionToken } from './models';

export class PluginWorker implements IWorker {
  // In Generation 5, plugin capabilities are mocked via internal functions.
  // This adapter bridges the Kernel's IWorker interface with the IPlugin artifact.

  constructor(
    private readonly plugin: IPlugin,
    private readonly pluginContext: PluginContext,
    private readonly token: ExecutionToken
  ) {}

  get workerId(): string {
    return this.plugin.descriptor.manifest.pluginId;
  }

  async execute(command: Command, attempt: ExecutionAttempt): Promise<readonly OSEvent[]> {
    const session: ExecutionSession = {
      sessionId: `sess-${attempt.executionId}-${attempt.attempt}`,
      executionToken: this.token,
      pluginContext: this.pluginContext,
      startTime: new Date().toISOString()
    };

    // Simulate execution context generation inside the plugin
    // Real implementation would invoke the WASM/V8 function here, passing the session
    // For Gen 5, if the command tells us to throw, we throw (for testing rollbacks).
    if (command.payload && (command.payload as any).throwError) {
      throw new Error((command.payload as any).throwError);
    }

    // Default successful event
    return [
      {
        eventId: `evt-${session.sessionId}`,
        type: 'COMMAND_COMPLETED',
        timestamp: new Date().toISOString(),
        source: this.workerId,
        payload: { commandId: command.commandId, sessionToken: session.executionToken.tokenId }
      }
    ];
  }
}
