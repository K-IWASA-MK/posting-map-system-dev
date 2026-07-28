/**
 * WorkflowInstanceRegistry.ts
 * 
 * Pure Registry for WorkflowInstance execution state
 */

import { WorkflowInstance } from '../types/WorkflowInstance';

export class WorkflowInstanceRegistry {
  private static instances: Map<string, WorkflowInstance> = new Map();
  private static taskToInstanceMap: Map<string, string> = new Map();

  public static register(instance: WorkflowInstance): void {
    const key = instance.instanceId.getValue();
    this.instances.set(key, instance);
    this.taskToInstanceMap.set(instance.taskId, key);
  }

  public static find(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  public static findByTaskId(taskId: string): WorkflowInstance | undefined {
    const instanceId = this.taskToInstanceMap.get(taskId);
    if (!instanceId) return undefined;
    return this.instances.get(instanceId);
  }

  public static remove(instanceId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (instance) {
      this.taskToInstanceMap.delete(instance.taskId);
    }
    return this.instances.delete(instanceId);
  }

  public static getAll(): WorkflowInstance[] {
    return Array.from(this.instances.values());
  }

  public static clear(): void {
    this.instances.clear();
    this.taskToInstanceMap.clear();
  }
}
