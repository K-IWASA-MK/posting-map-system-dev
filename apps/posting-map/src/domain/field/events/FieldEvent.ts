export interface FieldEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

export class FlyerHoldingCreatedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'FlyerHoldingCreatedEvent';
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly staffNo: string,
    public readonly initialQuantity: number
  ) {
    this.aggregateId = staffNo;
    this.occurredAt = new Date();
    this.eventId = `EV-FHC-${staffNo}-${this.occurredAt.getTime()}`;
  }
}

export class DistributionActivityRecordedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'DistributionActivityRecordedEvent';
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly activityId: string,
    public readonly staffNo: string,
    public readonly reportedQuantity: number,
    public readonly photoUrl: string,
    public readonly latitude: number,
    public readonly longitude: number
  ) {
    this.aggregateId = activityId;
    this.occurredAt = new Date();
    this.eventId = `EV-DAR-${activityId}-${this.occurredAt.getTime()}`;
  }
}
