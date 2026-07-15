import { IExecutionProcess } from '../launcher-runtime/IExecutionProcess';
import { LauncherRuntimeRegistry } from '../launcher-runtime/LauncherRuntimeRegistry';
import { ExecutionSession } from './ExecutionSession';
import { ISessionIdProvider } from './ISessionIdProvider';

/**
 * ExecutionSessionManager tracks active sessions and orchestrates their lifecycles.
 * Decouples process management from registries by receiving registry dependencies via DI.
 */
export class ExecutionSessionManager {
  private readonly registry: LauncherRuntimeRegistry;
  private readonly idProvider: ISessionIdProvider;
  private readonly sessions = new Map<string, ExecutionSession>();

  constructor(registry: LauncherRuntimeRegistry, idProvider: ISessionIdProvider) {
    this.registry = registry;
    this.idProvider = idProvider;
  }

  /**
   * Builds, starts, registers, and tracks a new execution session.
   * @param process Spawned runtime process reference.
   * @param requestId Correlation ID for tracing.
   */
  public createSession(process: IExecutionProcess, requestId?: string): ExecutionSession {
    const sessionId = this.idProvider.generateSessionId();
    const session = new ExecutionSession(sessionId, process.projectId, process, requestId);
    
    // Listen to exit events and output log lines
    session.start();

    // Register process in runtime repository
    this.registry.register(process);

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Finds a session by its unique ID.
   * @param sessionId Session identifier.
   */
  public getSession(sessionId: string): ExecutionSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Returns list of currently tracked sessions.
   */
  public listSessions(): ExecutionSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Stops a session and clears process references from the registry.
   * @param sessionId Session identifier.
   * @param signal Standard termination signal.
   */
  public async terminateSession(sessionId: string, signal: string = 'SIGTERM'): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    await session.stop(signal);
    this.registry.remove(session.process.processId);
  }
}
