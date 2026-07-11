import { Quantity } from '../../valueobjects/Quantity';

export class FlyerHolding {
  public readonly staffNo: string;
  private quantity: Quantity;
  private updatedAt: Date;

  constructor(params: {
    staffNo: string;
    quantity: Quantity;
    updatedAt?: Date;
  }) {
    if (!params.staffNo || params.staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    this.staffNo = params.staffNo;
    this.quantity = params.quantity;
    this.updatedAt = params.updatedAt || new Date();
  }

  public getQuantity(): Quantity {
    return this.quantity;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Directly sets the current self-declared quantity value.
   * Business rule: Subtraction, addition and reserve calculation methods are strictly prohibited.
   */
  public updateQuantity(newQuantity: Quantity): void {
    this.quantity = newQuantity;
    this.updatedAt = new Date();
  }
}
