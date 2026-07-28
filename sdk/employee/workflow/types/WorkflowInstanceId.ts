/**
 * WorkflowInstanceId.ts
 * 
 * Value Object representing a dynamic Workflow Instance Identifier
 */

export class WorkflowInstanceId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[WorkflowInstanceId] Workflow Instance ID cannot be empty');
    }
    this.id = id.trim();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: WorkflowInstanceId): boolean {
    return this.id === other.getValue();
  }

  public static of(id: string): WorkflowInstanceId {
    return new WorkflowInstanceId(id);
  }

  public static generate(prefix: string = 'inst-wf'): WorkflowInstanceId {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const random = Math.floor(1000 + Math.random() * 9000);
    return new WorkflowInstanceId(`${prefix}-${timestamp}-${random}`);
  }
}
