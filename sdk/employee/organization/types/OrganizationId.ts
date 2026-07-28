/**
 * OrganizationId.ts
 * 
 * Organization Identity Value Object
 */

export class OrganizationId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[OrganizationId] Organization ID cannot be empty');
    }
    this.id = id.trim();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: OrganizationId): boolean {
    return this.id === other.getValue();
  }

  public static of(id: string): OrganizationId {
    return new OrganizationId(id);
  }
}
