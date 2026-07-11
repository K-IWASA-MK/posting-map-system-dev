export interface MetricsEvent {
  readonly processingTime: number;
  readonly validationTime: number;
  readonly routingTime: number;
  readonly handlerTime: number;
  readonly statusCode: number;
  readonly cacheStatus: 'HIT' | 'MISS' | 'NONE';
}
