/**
 * WorkflowBlueprintRegistry.ts
 * 
 * Pure Registry for WorkflowBlueprint specifications
 */

import { WorkflowBlueprint } from '../types/WorkflowBlueprint';

export class WorkflowBlueprintRegistry {
  private static blueprints: Map<string, WorkflowBlueprint> = new Map();

  public static register(blueprint: WorkflowBlueprint): void {
    this.blueprints.set(blueprint.blueprintId, blueprint);
  }

  public static find(blueprintId: string): WorkflowBlueprint | undefined {
    return this.blueprints.get(blueprintId);
  }

  public static remove(blueprintId: string): boolean {
    return this.blueprints.delete(blueprintId);
  }

  public static getAll(): WorkflowBlueprint[] {
    return Array.from(this.blueprints.values());
  }

  public static clear(): void {
    this.blueprints.clear();
  }
}
