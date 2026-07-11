export class Quantity {
  private readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Quantity must be an integer");
    }
    if (value < 0) {
      throw new Error("Quantity cannot be negative");
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public add(other: Quantity): Quantity {
    return new Quantity(this.value + other.getValue());
  }

  public subtract(other: Quantity): Quantity {
    if (this.value < other.getValue()) {
      throw new Error("Resulting quantity cannot be negative");
    }
    return new Quantity(this.value - other.getValue());
  }

  public equals(other: Quantity): boolean {
    return this.value === other.getValue();
  }
}
