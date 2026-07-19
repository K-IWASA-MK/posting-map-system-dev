import { SandboxInstance } from './SandboxInstance';
import { SandboxProfile, StandardSandboxProfiles, SandboxProfileType } from './SandboxProfile';
import { SandboxPolicy } from './SandboxPolicy';
import { SecurityRuntime } from '../SecurityRuntime';
import { SecurityContext } from '../SecurityModels';

export class SandboxManager {
  private activeSandboxes = new Map<string, SandboxInstance>();

  constructor(private readonly securityRuntime: SecurityRuntime) {}

  public async createSandbox(pluginId: string, profileType: SandboxProfileType): Promise<SandboxInstance> {
    const profile = StandardSandboxProfiles[profileType];
    
    // Build ResourcePolicy corresponding to Profile parameters
    const policy: SandboxPolicy = {
      policyId: `POL-SBX-${profileType}`,
      profileName: profileType,
      resourcePolicy: {
        cpuLimit: profile.resourceLimits.cpuPercent,
        memoryLimit: profile.resourceLimits.memoryMb,
        diskLimit: 1000,
        networkPolicy: profile.networkAllowed ? (profileType === 'LIMITED_NETWORK' ? 'RESTRICTED' : 'ALLOW_ALL') : 'DENY_ALL',
        filesystemPolicy: profile.fileAccess
      }
    };

    const instance = new SandboxInstance(pluginId, profile, policy);
    await instance.initialize();
    
    this.activeSandboxes.set(instance.sandboxId, instance);

    await this.securityRuntime.publishEvent('SandboxCreated', {
      sandboxId: instance.sandboxId,
      pluginId,
      profileName: profileType,
      state: 'RUNNING'
    });

    return instance;
  }

  public async executeInSandbox(sandboxId: string, code: string): Promise<string> {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const secCtx: SecurityContext = {
      contextId: `CTX-SBX-${Date.now()}`,
      runtimeId: 'aios.sandbox-manager',
      pluginId: sandbox.pluginId,
      principalId: `plugin-runner:${sandbox.pluginId}`,
      sessionId: `sess-${sandboxId}`,
      sandboxId,
      trustLevel: sandbox.profile.profileName === 'FULLY_ISOLATED' ? 'LOW' : 'MEDIUM',
      capabilities: []
    };

    await this.securityRuntime.publishEvent('PluginExecutionStarted', {
      sandboxId,
      pluginId: sandbox.pluginId,
      state: 'RUNNING'
    });

    try {
      const result = await sandbox.run(code);
      
      // Perform resource limit checks
      const usage = sandbox.getResourceUsage();
      const limit = sandbox.policy.resourcePolicy.memoryLimit;
      if (usage.memory > limit) {
        throw new Error(`ResourceLimitExceeded: Memory usage ${usage.memory}MB exceeded policy limit of ${limit}MB`);
      }

      return result;
    } catch (err: any) {
      // Security violation detected!
      await this.securityRuntime.detectViolation(
        secCtx,
        `Sandbox violation: ${err.message}`,
        'CRITICAL'
      );

      // Force teardown on violation/limit exceedance
      await this.destroySandbox(sandboxId);
      throw err;
    }
  }

  public async destroySandbox(sandboxId: string): Promise<void> {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (sandbox) {
      await sandbox.destroy();
      this.activeSandboxes.delete(sandboxId);

      await this.securityRuntime.publishEvent('SandboxDestroyed', {
        sandboxId,
        pluginId: sandbox.pluginId,
        state: 'RUNNING'
      });
    }
  }

  public getSandbox(sandboxId: string): SandboxInstance | undefined {
    return this.activeSandboxes.get(sandboxId);
  }

  public getActiveSandboxCount(): number {
    return this.activeSandboxes.size;
  }
}
