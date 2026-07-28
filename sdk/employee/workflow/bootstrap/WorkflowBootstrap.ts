/**
 * WorkflowBootstrap.ts
 * 
 * Bootstraps Standard Workflows and Blueprints into Registries on AIOS Startup
 */

import { StandardWorkflowCatalog } from '../catalog/StandardWorkflowCatalog';
import { WorkflowBlueprintRegistry } from '../blueprint/registry/WorkflowBlueprintRegistry';
import { WorkflowRegistry } from '../registry/WorkflowRegistry';
import { WorkflowFactory } from '../blueprint/WorkflowFactory';

export class WorkflowBootstrap {
  public static bootstrap(): void {
    const blueprints = StandardWorkflowCatalog.getAllStandardBlueprints();
    
    blueprints.forEach((bp) => {
      WorkflowBlueprintRegistry.register(bp);
      const workflow = WorkflowFactory.createWorkflowFromBlueprint(bp);
      WorkflowRegistry.register(workflow);
    });
  }
}
