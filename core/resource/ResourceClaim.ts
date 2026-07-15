export interface ResourceClaim {
  readonly claimId: string;
  readonly reservationId: string;
  readonly claimedAt: number;
  readonly status: "PENDING" | "VALIDATED" | "REJECTED";
}
