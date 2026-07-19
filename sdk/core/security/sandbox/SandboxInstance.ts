import { SandboxProfile } from './SandboxProfile';
import { SandboxPolicy } from './SandboxPolicy';

export type SandboxState = 'CREATED' | 'INITIALIZED' | 'RUNNING' | 'SUSPENDED' | 'DESTROYED';

export class SandboxInstance {
  public readonly sandboxId: string;
  private state: SandboxState = 'CREATED';
  private resourceUsage = { cpu: 0, memory: 0 };

  constructor(
    public readonly pluginId: string,
    public readonly profile: SandboxProfile,
    public readonly policy: SandboxPolicy
  ) {
    this.sandboxId = `SBX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  public getState(): SandboxState {
    return this.state;
  }

  public async initialize(): Promise<void> {
    if (this.state !== 'CREATED') {
      throw new Error(`Invalid state transition: Cannot initialize from ${this.state}`);
    }
    this.state = 'INITIALIZED';
  }

  public async run(pluginCode: string): Promise<string> {
    if (this.state !== 'INITIALIZED' && this.state !== 'SUSPENDED') {
      throw new Error(`Invalid state transition: Cannot run from ${this.state}`);
    }
    this.state = 'RUNNING';

    // Mock Execution behavior
    if (pluginCode.includes('throw_security_exception')) {
      throw new Error('SecurityException: Memory limit exceeded');
    }

    if (this.resourceUsage.memory === 0) {
      this.resourceUsage = { cpu: 10, memory: 128 }; // Simulated usage
    }

    return `Simulated sandboxed execution of plugin ${this.pluginId} succeeded`;
  }

  public async suspend(): Promise<void> {
    if (this.state !== 'RUNNING') {
      throw new Error(`Invalid state transition: Cannot suspend from ${this.state}`);
    }
    this.state = 'SUSPENDED';
  }

  public async destroy(): Promise<void> {
    this.state = 'DESTROYED';
    this.resourceUsage = { cpu: 0, memory: 0 }; // Free resources
  }

  public getResourceUsage(): { cpu: number; memory: number } {
    return this.resourceUsage;
  }

  public simulateResourceUsage(cpu: number, memory: number): void {
    this.resourceUsage = { cpu, memory };
  }
}
