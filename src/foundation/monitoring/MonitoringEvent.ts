export type EventCategory = 'AUDIT' | 'METRICS' | 'LIFECYCLE' | 'EXCEPTION';

export interface MonitoringEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly category: EventCategory;
  readonly sequenceNumber: number;
  readonly requestId: string;
  readonly timestamp: number;
  readonly source: string;
  readonly payload: Record<string, any>;
}
