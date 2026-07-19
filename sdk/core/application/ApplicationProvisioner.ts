import { ProvisioningPlan, ApplicationDefinition } from './ApplicationModels';
import { ServiceRegistry } from '../service/ServiceRegistry';

export class ApplicationProvisioner {
  private plans = new Map<string, ProvisioningPlan>();

  public createPlan(app: ApplicationDefinition, requiredCapabilities: string[]): ProvisioningPlan {
    const planId = `PLN-APP-${app.applicationId}-${Date.now()}`;
    const plan: ProvisioningPlan = {
      planId,
      applicationId: app.applicationId,
      requiredServices: app.services,
      requiredCapabilities,
      deploymentPolicy: 'STRICT-DEP-CHECK',
      status: 'PLANNING'
    };
    this.plans.set(planId, plan);
    return plan;
  }

  public getPlan(planId: string): ProvisioningPlan | undefined {
    return this.plans.get(planId);
  }

  public validatePlan(planId: string, serviceRegistry: ServiceRegistry): ProvisioningPlan {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Provisioning plan ${planId} not found`);
    }

    // Check that all required services exist in the service registry
    for (const serviceId of plan.requiredServices) {
      const srv = serviceRegistry.getService(serviceId);
      if (!srv) {
        this.plans.set(planId, { ...plan, status: 'FAILED' });
        throw new Error(`Provisioning validation failed: dependency service ${serviceId} is missing`);
      }
    }

    const updated: ProvisioningPlan = { ...plan, status: 'VALIDATED' };
    this.plans.set(planId, updated);
    return updated;
  }

  public completePlan(planId: string): void {
    const plan = this.plans.get(planId);
    if (plan) {
      this.plans.set(planId, { ...plan, status: 'COMPLETED' });
    }
  }

  public rollbackPlan(planId: string): void {
    const plan = this.plans.get(planId);
    if (plan) {
      this.plans.set(planId, { ...plan, status: 'FAILED' });
    }
  }
}
