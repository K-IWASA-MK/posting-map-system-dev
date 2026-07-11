export class CreateFlyerStockCommand {
  constructor(
    public readonly flyerStockId: string,
    public readonly ownerId: string,
    public readonly areaId: string,
    public readonly quantity: number
  ) {
    if (!flyerStockId || flyerStockId.trim().length === 0) {
      throw new Error("flyerStockId is required");
    }
    if (!ownerId || ownerId.trim().length === 0) {
      throw new Error("ownerId is required");
    }
    if (!areaId || areaId.trim().length === 0) {
      throw new Error("areaId is required");
    }
    if (quantity < 0) {
      throw new Error("quantity cannot be negative");
    }
  }
}
