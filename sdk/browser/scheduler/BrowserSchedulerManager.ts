import { BrowserSchedulerEngine } from './BrowserSchedulerEngine';
import { HumanAuthBoundaryManager } from './auth/HumanAuthBoundaryManager';
import { SchedulerRecoveryManager } from './recovery/SchedulerRecoveryManager';
import { SchedulerState } from './types/SchedulerState';
import { ScheduledJob } from './types/ScheduledJob';
import { HumanAuthRequest } from './types/HumanAuthRequest';
import { AuthenticationProvider } from './types/AuthenticationProvider';
import { ResumeStrategy } from './types/ResumePolicy';
import { SchedulerMetrics } from './types/SchedulerMetrics';

export class BrowserSchedulerManager {
  private static instance: BrowserSchedulerManager | null = null;
  private engine: BrowserSchedulerEngine;
  private authBoundaryManager: HumanAuthBoundaryManager;
  private recoveryManager: SchedulerRecoveryManager;

  private constructor() {
    this.engine = new BrowserSchedulerEngine();
    this.authBoundaryManager = new HumanAuthBoundaryManager();
    this.recoveryManager = new SchedulerRecoveryManager();
  }

  public static getInstance(): BrowserSchedulerManager {
    if (!BrowserSchedulerManager.instance) {
      BrowserSchedulerManager.instance = new BrowserSchedulerManager();
    }
    return BrowserSchedulerManager.instance;
  }

  public static resetInstance(): void {
    BrowserSchedulerManager.instance = null;
  }

  public start(): void {
    this.engine.start();
  }

  public stop(): void {
    this.engine.stop();
  }

  public pause(): void {
    this.engine.pause();
  }

  public resume(): void {
    this.engine.resume();
  }

  public state(): SchedulerState {
    return this.engine.state();
  }

  public registerJob(job: ScheduledJob): void {
    this.engine.registerJob(job);
  }

  public async requestHumanAuth(
    agentId: string,
    taskId: string,
    reason: string,
    provider: AuthenticationProvider,
    requiredAction: string,
    resumeStrategy: ResumeStrategy = ResumeStrategy.RESUME_FROM_WAIT
  ): Promise<HumanAuthRequest> {
    this.pause();
    return await this.authBoundaryManager.createAuthRequest(agentId, taskId, reason, provider, requiredAction, resumeStrategy);
  }

  public async completeHumanAuth(requestId: string): Promise<boolean> {
    const req = await this.authBoundaryManager.completeAuthRequest(requestId);
    if (req) {
      this.resume();
      return true;
    }
    return false;
  }

  public async recover(): Promise<boolean> {
    return await this.recoveryManager.performRecoverySequence(this.engine);
  }

  public getMetrics(): SchedulerMetrics {
    return this.engine.getMetrics();
  }
}
