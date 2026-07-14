import { Quantity } from '../../valueobjects/Quantity';
import { FlyerShortageWarningEvent, FlyerOutOfStockEvent } from '../../events/FieldDomainEvents';
import { FieldEvent } from '../../events/FieldEvent';

export class FlyerHolding {
  public readonly staffNo: string;
  private quantity: Quantity;
  private updatedAt: Date;
  public readonly cityName: string;
  
  // Track if low stock warning was already triggered for this instance
  private warningTriggered: boolean = false;
  // Threshold can be set dynamically, or defaults to 100 as in the tests
  private readonly threshold: number = 100;

  constructor(params: {
    staffNo: string;
    quantity: Quantity;
    updatedAt?: Date;
    cityName?: string;
    warningTriggered?: boolean;
  }) {
    if (!params.staffNo || params.staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    this.staffNo = params.staffNo;
    this.quantity = params.quantity;
    this.updatedAt = params.updatedAt || new Date();
    this.cityName = params.cityName || '-';
    this.warningTriggered = params.warningTriggered || false;
  }

  public getQuantity(): Quantity {
    return this.quantity;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public isLowStock(): boolean {
    return this.quantity.getValue() <= this.threshold && this.quantity.getValue() > 0;
  }

  public isOutOfStock(): boolean {
    return this.quantity.getValue() === 0;
  }

  public isWarningTriggered(): boolean {
    return this.warningTriggered;
  }

  /**
   * Allocates/Increments flyer stock (e.g., when receiving new flyers)
   */
  public allocate(qty: Quantity): void {
    this.quantity = this.quantity.add(qty);
    this.updatedAt = new Date();
    // Reset warning flag since stock increased
    if (this.quantity.getValue() > this.threshold) {
      this.warningTriggered = false;
    }
  }

  /**
   * Consumes/Decrements flyer stock when distributed.
   * Returns list of domain events triggered by this action.
   */
  public consume(qty: Quantity): FieldEvent[] {
    const events: FieldEvent[] = [];
    
    if (this.quantity.getValue() < qty.getValue()) {
      throw new Error("FlyerOutOfStock");
    }

    this.quantity = this.quantity.subtract(qty);
    this.updatedAt = new Date();

    if (this.isLowStock() && !this.warningTriggered) {
      this.warningTriggered = true;
      events.push(new FlyerShortageWarningEvent(this.staffNo, this.quantity.getValue(), this.threshold));
    }

    if (this.isOutOfStock()) {
      events.push(new FlyerOutOfStockEvent(this.staffNo));
    }

    return events;
  }

  /**
   * Returns flyers back to stock (e.g., return leftover flyers)
   */
  public returnToStock(qty: Quantity): void {
    this.quantity = this.quantity.add(qty);
    this.updatedAt = new Date();
    if (this.quantity.getValue() > this.threshold) {
      this.warningTriggered = false;
    }
  }

  /**
   * Adjusts the stock to an absolute value (e.g., manual count correction).
   * Returns list of domain events triggered if it falls below threshold.
   */
  public adjust(newQty: Quantity): FieldEvent[] {
    const events: FieldEvent[] = [];
    this.quantity = newQty;
    this.updatedAt = new Date();

    // Reset warning if adjusted above threshold
    if (this.quantity.getValue() > this.threshold) {
      this.warningTriggered = false;
    }

    if (this.isLowStock() && !this.warningTriggered) {
      this.warningTriggered = true;
      events.push(new FlyerShortageWarningEvent(this.staffNo, this.quantity.getValue(), this.threshold));
    }

    if (this.isOutOfStock()) {
      events.push(new FlyerOutOfStockEvent(this.staffNo));
    }

    return events;
  }

  /**
   * Directly sets the current self-declared quantity value.
   * Backward compatibility method.
   */
  public updateQuantity(newQuantity: Quantity): void {
    this.quantity = newQuantity;
    this.updatedAt = new Date();
  }
}
