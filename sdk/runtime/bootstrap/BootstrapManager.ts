/**
 * BootstrapManager.ts
 * 
 * Unified Bootstrap Manager orchestrating OrganizationBootstrap and AutonomousRuntimeBootstrap
 */

import { OrganizationBootstrap } from '../../employee/organization/bootstrap/OrganizationBootstrap';
import { WorkflowBootstrap } from '../../employee/workflow/bootstrap/WorkflowBootstrap';
import { AutonomousRuntimeBootstrap, AutonomousRuntimeState } from '../../runtime/bootstrap/AutonomousRuntimeBootstrap';
import { AIEmployeeRegistry } from '../../employee/manager/registry/AIEmployeeRegistry';

export class BootstrapManager {
  private static initialized: boolean = false;
  private static sharedRegistry: AIEmployeeRegistry = new AIEmployeeRegistry();

  public static initialize(): AutonomousRuntimeState {
    if (this.initialized) {
      return AutonomousRuntimeBootstrap.getState();
    }

    // 1. Bootstrap Organization & AI Employees into sharedRegistry
    OrganizationBootstrap.bootstrap(this.sharedRegistry);

    // 2. Bootstrap Workflows & Blueprints into registries
    WorkflowBootstrap.bootstrap();

    // 3. Start Autonomous Runtime Bootstrap with sharedRegistry
    const state = AutonomousRuntimeBootstrap.start(this.sharedRegistry);

    this.initialized = true;
    return state;
  }

  public static getSharedRegistry(): AIEmployeeRegistry {
    return this.sharedRegistry;
  }

  public static clear(): void {
    AutonomousRuntimeBootstrap.clear();
    this.sharedRegistry = new AIEmployeeRegistry();
    this.initialized = false;
  }
}
