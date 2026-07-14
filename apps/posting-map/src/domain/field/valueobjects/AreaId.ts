export class AreaId {
  private readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new Error("AreaId cannot be empty");
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error("AreaId cannot be empty or whitespace");
    }
    this.value = trimmed;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: AreaId): boolean {
    return this.value === other.getValue();
  }
}
