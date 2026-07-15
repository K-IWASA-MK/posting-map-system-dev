import { BootstrapRuntime } from './bootstrap/BootstrapRuntime';
import { BootstrapConfiguration } from './bootstrap/BootstrapConfiguration';
import { HealthStatus } from './bootstrap/HealthCheck';
import { VersionProvider } from './bootstrap/VersionProvider';
import { DevelopmentContext } from './context/DevelopmentContext';
import { DevelopmentGovernanceResult } from './governance/DevelopmentGovernanceResult';
import { DevelopmentSession, DevelopmentSessionStatus } from './bootstrap/DevelopmentSession';
import { ExecutionRecorder } from './ledger/ExecutionRecorder';
import { AIOSState } from './bootstrap/LifecycleManager';

export class DevelopmentOS {
  private runtime: BootstrapRuntime;
  private activeSessionsCount: number = 0;

  constructor(config: BootstrapConfiguration) {
    this.runtime = new BootstrapRuntime(config);
  }

  /**
   * Initializes the AIOS. Idempotent.
   */
  public async initialize(): Promise<void> {
    await this.runtime.initialize();
  }

  /**
   * Main entry point to run a development request.
   */
  public async run(context: DevelopmentContext): Promise<DevelopmentGovernanceResult> {
    if (this.runtime.getState() !== AIOSState.READY && this.runtime.getState() !== AIOSState.IDLE) {
      throw new Error(`AIOS is not ready. Current state: ${this.runtime.getState()}`);
    }

    if (!context || !context.contextId) {
      throw new Error("Validation Error: Invalid or empty context provided.");
    }

    this.runtime.transitionTo(AIOSState.RUNNING);
    this.activeSessionsCount++;

    const sessionId = `SESS-${Date.now()}`;
    const executionId = `EXEC-${Date.now()}`;
    
    const session: DevelopmentSession = {
      sessionId,
      requestId: `REQ-${Date.now()}`,
      executionId,
      contextId: context.contextId,
      startTime: Date.now(),
      status: DevelopmentSessionStatus.RUNNING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Prepare ledger recorder for this session
    const recorder = new ExecutionRecorder(this.runtime.ledgerAdapter, executionId, sessionId);

    try {
      const result = await this.runtime.coordinator.run(context, recorder);
      
      // Update session status (in memory simulation)
      (session as any).status = DevelopmentSessionStatus.COMPLETED;
      (session as any).updatedAt = new Date().toISOString();

      return result;
    } catch (error) {
      (session as any).status = DevelopmentSessionStatus.FAILED;
      (session as any).updatedAt = new Date().toISOString();
      this.runtime.transitionTo(AIOSState.ERROR); // Coordinator exception handling
      throw error;
    } finally {
      this.activeSessionsCount--;
      if (this.runtime.getState() === AIOSState.RUNNING) {
        this.runtime.transitionTo(AIOSState.READY); // Return to ready
      }
    }
  }

  /**
   * Shuts down the AIOS safely.
   */
  public async shutdown(): Promise<void> {
    await this.runtime.shutdown();
  }

  /**
   * Returns current health of the OS.
   */
  public health(): HealthStatus {
    const uptimeMs = this.runtime.bootTimeStr ? Date.now() - new Date(this.runtime.bootTimeStr).getTime() : 0;
    
    return {
      state: this.runtime.getState(),
      bootTime: this.runtime.bootTimeStr,
      activeSessions: this.activeSessionsCount,
      components: {
        pluginsLoaded: 0, // Mocked for now
        reviewersLoaded: 0, // Mocked for now
        ledgerConnected: this.runtime.ledgerAdapter !== undefined,
        governanceReady: this.runtime.coordinator !== undefined
      },
      uptimeMs
    };
  }

  /**
   * Returns AIOS version info.
   */
  public version() {
    return VersionProvider.getVersionInfo();
  }
}
