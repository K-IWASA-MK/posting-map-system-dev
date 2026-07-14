export interface ResourceReservation {
  readonly reservationId: string;
  readonly requirementId: string;
  readonly reservedAt: number;
  readonly expiresAt: number;
  readonly status: "PENDING" | "ACTIVE" | "EXPIRED" | "CLAIMED";
}
