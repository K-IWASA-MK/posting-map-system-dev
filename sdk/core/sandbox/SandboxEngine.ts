import { ContainerDefinition } from '../container/ContainerDefinition';
import { SandboxPolicy, PolicyValidationResult } from './SandboxPolicy';
import { SecretIsolation } from './SecretIsolation';
import { AIOSEventBus } from '../event/AIOSEventBus';

export class SandboxEngine {
  private readonly policy = new SandboxPolicy();
  private readonly secretIsolation: SecretIsolation;

  // Mock validations passing by default
  public identityPassed = true;
  public trustPassed = true;
  public securityPassed = true;

  constructor(private readonly eventBus: AIOSEventBus) {
    this.secretIsolation = new SecretIsolation(eventBus);
  }

  public validatePolicyForContainer(definition: ContainerDefinition): PolicyValidationResult {
    return this.policy.evaluateContainerPolicy(definition, {
      identityPassed: this.identityPassed,
      trustPassed: this.trustPassed,
      securityPassed: this.securityPassed
    });
  }

  public getSecretIsolation(): SecretIsolation {
    return this.secretIsolation;
  }

  public getPolicy(): SandboxPolicy {
    return this.policy;
  }
}
