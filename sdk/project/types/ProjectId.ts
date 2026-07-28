/**
 * ProjectId.ts
 * 
 * Value Object representing a Client Project Identifier
 */

export class ProjectId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[ProjectId] Project ID cannot be empty');
    }
    this.id = id.trim().toUpperCase();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: ProjectId): boolean {
    return this.id === other.getValue();
  }

  public static of(id: string): ProjectId {
    return new ProjectId(id);
  }
}
