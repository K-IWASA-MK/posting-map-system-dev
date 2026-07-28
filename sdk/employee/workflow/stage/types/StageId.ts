/**
 * StageId.ts
 * 
 * Value Object representing a Workflow Stage Identifier
 */

export class StageId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[StageId] Stage ID cannot be empty');
    }
    this.id = id.trim().toUpperCase();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: StageId): boolean {
    return this.id === other.getValue();
  }

  public static of(id: string): StageId {
    return new StageId(id);
  }
}
