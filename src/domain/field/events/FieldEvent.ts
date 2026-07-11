export interface FieldEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

export class FlyerStockCreatedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'FlyerStockCreatedEvent';
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly flyerStockId: string,
    public readonly ownerId: string,
    public readonly areaId: string,
    public readonly initialQuantity: number
  ) {
    this.aggregateId = flyerStockId;
    this.occurredAt = new Date();
    this.eventId = `EV-FSC-${flyerStockId}-${this.occurredAt.getTime()}`;
  }
}

export class FlyerReservedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'FlyerReservedEvent';
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly flyerStockId: string,
    public readonly ownerId: string,
    public readonly reservedAmount: number,
    public readonly remainingAmount: number
  ) {
    this.aggregateId = flyerStockId;
    this.occurredAt = new Date();
    this.eventId = `EV-FR-${flyerStockId}-${this.occurredAt.getTime()}`;
  }
}
