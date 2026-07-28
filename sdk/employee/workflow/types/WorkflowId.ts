/**
 * WorkflowId.ts
 * 
 * Value Object representing a Workflow Identifier
 */

export class WorkflowId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[WorkflowId] Workflow ID cannot be empty');
    }
    this.id = id.trim().toUpperCase();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: WorkflowId): boolean {
    return this.id === other.getValue();
  }

  public static of(id: string): WorkflowId {
    return new WorkflowId(id);
  }
}
