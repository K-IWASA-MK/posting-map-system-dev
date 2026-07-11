export class ReserveFlyerCommand {
  constructor(
    public readonly flyerStockId: string,
    public readonly distributorId: string,
    public readonly quantity: number
  ) {
    if (!flyerStockId || flyerStockId.trim().length === 0) {
      throw new Error("flyerStockId is required");
    }
    if (!distributorId || distributorId.trim().length === 0) {
      throw new Error("distributorId is required");
    }
    if (quantity <= 0) {
      throw new Error("quantity must be greater than 0");
    }
  }
}
