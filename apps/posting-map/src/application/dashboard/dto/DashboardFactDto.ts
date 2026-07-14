export interface DashboardFactDto {
  readonly id: string;
  readonly date: string;
  readonly district: string;
  readonly area: string;
  readonly distributionCount: number;
  readonly syncStatus: string;
  readonly gpsEvidence: string | null;
  readonly photoEvidence: string | null;
}
