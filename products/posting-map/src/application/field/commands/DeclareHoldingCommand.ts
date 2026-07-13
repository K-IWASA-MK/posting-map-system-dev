export class DeclareHoldingCommand {
  constructor(
    public readonly staffNo: string,
    public readonly quantity: number
  ) {
    if (!staffNo || staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    if (quantity < 0) {
      throw new Error("quantity cannot be negative");
    }
  }
}
