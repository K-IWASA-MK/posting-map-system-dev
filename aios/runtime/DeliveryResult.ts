export interface DeliveryResult {
  readonly messageId: string;
  readonly routeId: string;
  readonly delivered: boolean;
  readonly deliveredAt: string;
}
