import { FieldEvent } from './FieldEvent';

export class DistributionActivityCompletedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'DistributionActivityCompleted';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string, // activityId
    public readonly staffNo: string,
    public readonly quantity: number,
    public readonly areaId: string
  ) {
    this.occurredAt = new Date();
    this.eventId = `EV-DAC-${aggregateId}-${this.occurredAt.getTime()}`;
  }
}

export class FlyerShortageWarningEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'FlyerShortageWarning';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string, // staffNo
    public readonly remainingQuantity: number,
    public readonly threshold: number
  ) {
    this.occurredAt = new Date();
    this.eventId = `EV-FSW-${aggregateId}-${this.occurredAt.getTime()}`;
  }
}

export class FlyerOutOfStockEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'FlyerOutOfStock';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string // staffNo
  ) {
    this.occurredAt = new Date();
    this.eventId = `EV-FOS-${aggregateId}-${this.occurredAt.getTime()}`;
  }
}

export class GPSEvidenceRejectedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'GPSEvidenceRejected';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string, // activityId
    public readonly reason: string
  ) {
    this.occurredAt = new Date();
    this.eventId = `EV-GER-${aggregateId}-${this.occurredAt.getTime()}`;
  }
}

export class PhotoEvidenceRejectedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'PhotoEvidenceRejected';
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string, // activityId
    public readonly reason: string
  ) {
    this.occurredAt = new Date();
    this.eventId = `EV-PER-${aggregateId}-${this.occurredAt.getTime()}`;
  }
}
