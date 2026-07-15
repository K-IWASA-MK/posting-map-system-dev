import { BootstrapConfiguration } from './BootstrapConfiguration';
import { LifecycleManager, AIOSState } from './LifecycleManager';
import { StartupPipeline } from './StartupPipeline';
import { ShutdownPipeline } from './ShutdownPipeline';
import { JsonExecutionLedgerAdapter } from '../ledger/JsonExecutionLedgerAdapter';
import { DevelopmentRuleEngine } from '../engine/DevelopmentRuleEngine';
import { PluginRegistry } from '../engine/PluginRegistry';
import { DevelopmentGovernanceEngine } from '../governance/DevelopmentGovernanceEngine';
import { ExecutionCoordinator } from './ExecutionCoordinator';

export class BootstrapRuntime {
  private lifecycle: LifecycleManager;
  private config: BootstrapConfiguration;
  
  public ledgerAdapter!: JsonExecutionLedgerAdapter;
  public coordinator!: ExecutionCoordinator;
  public bootTimeStr: string = '';

  constructor(config: BootstrapConfiguration) {
    this.config = config;
    this.lifecycle = new LifecycleManager(); // Initial state: BOOTING
  }

  public async initialize(): Promise<void> {
    if (this.lifecycle.getState() !== AIOSState.BOOTING && this.lifecycle.getState() !== AIOSState.SHUTDOWN) {
      // Idempotency: Ignore multiple initializations if already READY or RUNNING
      if (this.lifecycle.getState() === AIOSState.READY || this.lifecycle.getState() === AIOSState.RUNNING) {
        return;
      }
      this.lifecycle.transitionTo(AIOSState.BOOTING);
    }

    this.bootTimeStr = new Date().toISOString();

    // Setup Storage Adapter (e.g. JSON Adapter)
    this.ledgerAdapter = new JsonExecutionLedgerAdapter('/tmp/aios_system_ledger.json');

    // Run Startup Pipeline
    const startup = new StartupPipeline();
    await startup.execute(this.config, this.ledgerAdapter);

    // Initialize Foundation components
    const registry = new PluginRegistry();
    const engine = new DevelopmentRuleEngine(registry);
    const governance = new DevelopmentGovernanceEngine();
    
    this.coordinator = new ExecutionCoordinator(engine, governance);

    // Record System Boot
    await this.ledgerAdapter.append({
      entryId: `SYS-${Date.now()}`,
      executionId: 'SYS-BOOT',
      correlationId: 'SYS-BOOT',
      timestamp: this.bootTimeStr,
      entryType: 'SYSTEM' as any,
      payload: Object.freeze({ action: 'AIOS Bootstrap Completed' }),
      version: '1.0',
      sequenceNo: 1
    });

    this.lifecycle.transitionTo(AIOSState.READY);
  }

  public async shutdown(): Promise<void> {
    if (this.lifecycle.getState() === AIOSState.SHUTDOWN) return;
    
    this.lifecycle.transitionTo(AIOSState.SHUTDOWN);
    const shutdownPipe = new ShutdownPipeline();
    if (this.ledgerAdapter) {
      await shutdownPipe.execute(this.ledgerAdapter);
    }
  }

  public getState(): AIOSState {
    return this.lifecycle.getState();
  }

  public transitionTo(state: AIOSState): void {
    this.lifecycle.transitionTo(state);
  }
}
