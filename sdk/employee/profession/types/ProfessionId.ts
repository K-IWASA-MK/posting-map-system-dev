/**
 * ProfessionId.ts
 * 
 * Profession Identity Value Object
 */

export class ProfessionId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[ProfessionId] Profession ID cannot be empty');
    }
    this.id = id.trim().toUpperCase();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: ProfessionId): boolean {
    return this.id === other.getValue();
  }

  public static of(id: string): ProfessionId {
    return new ProfessionId(id);
  }
}
