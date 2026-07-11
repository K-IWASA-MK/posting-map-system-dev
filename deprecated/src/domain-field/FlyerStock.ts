import { AreaId } from '../valueobjects/AreaId';
import { Quantity } from '../valueobjects/Quantity';

export type FlyerStockStatus = 'AVAILABLE' | 'RESERVED' | 'DEPLETED';

export class FlyerStock {
  public readonly id: string;
  public readonly ownerId: string;
  public readonly areaId: AreaId;
  private quantity: Quantity;
  private status: FlyerStockStatus;
  public readonly createdAt: Date;
  private updatedAt: Date;

  constructor(params: {
    id: string;
    ownerId: string;
    areaId: AreaId;
    quantity: Quantity;
    status: FlyerStockStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("FlyerStock ID cannot be empty");
    }
    if (!params.ownerId || params.ownerId.trim().length === 0) {
      throw new Error("Owner ID cannot be empty");
    }
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.areaId = params.areaId;
    this.quantity = params.quantity;
    this.status = params.status;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  public getQuantity(): Quantity {
    return this.quantity;
  }

  public getStatus(): FlyerStockStatus {
    return this.status;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public reserve(amount: Quantity): void {
    if (this.status === 'DEPLETED') {
      throw new Error("Cannot reserve from depleted stock");
    }
    if (this.quantity.getValue() < amount.getValue()) {
      throw new Error("Insufficient stock to reserve");
    }
    
    this.quantity = this.quantity.subtract(amount);
    
    if (this.quantity.getValue() === 0) {
      this.status = 'DEPLETED';
    } else {
      this.status = 'RESERVED';
    }
    this.updatedAt = new Date();
  }

  public replenish(amount: Quantity): void {
    this.quantity = this.quantity.add(amount);
    this.status = 'AVAILABLE';
    this.updatedAt = new Date();
  }
}
