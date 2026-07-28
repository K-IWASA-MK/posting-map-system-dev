/**
 * DomainId.ts
 * 
 * Domain Identity Value Object with Dot-Separated Hierarchy Support
 */

export class DomainId {
  private readonly id: string;

  constructor(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('[DomainId] Domain ID cannot be empty');
    }
    this.id = id.trim().toUpperCase();
  }

  public getValue(): string {
    return this.id;
  }

  public equals(other: DomainId): boolean {
    return this.id === other.getValue();
  }

  /**
   * Evaluates if this domain matches a requested domain pattern.
   * Supports dot-separated hierarchy (e.g., FIELD_OPS matches FIELD_OPS.REGION_A)
   */
  public matches(targetDomainId: string): boolean {
    const target = targetDomainId.trim().toUpperCase();
    if (this.id === target) {
      return true;
    }
    if (target.startsWith(`${this.id}.`)) {
      return true;
    }
    if (this.id.startsWith(`${target}.`)) {
      return true;
    }
    return false;
  }

  public static of(id: string): DomainId {
    return new DomainId(id);
  }

  // Pre-defined Standard Domains
  public static readonly AIOS = 'AIOS';
  public static readonly FIELD_OPS = 'FIELD_OPS';
  public static readonly NORTH_CH = 'NORTH_CH';
  public static readonly GAS = 'GAS';
  public static readonly GITHUB = 'GITHUB';
  public static readonly MAPBOX = 'MAPBOX';
  public static readonly GOOGLE_APPS_SCRIPT = 'GOOGLE_APPS_SCRIPT';
  public static readonly LINE = 'LINE';
  public static readonly CANVA = 'CANVA';
}
