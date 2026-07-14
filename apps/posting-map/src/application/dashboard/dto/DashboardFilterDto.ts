export interface DashboardFilterDto {
  readonly date?: string;
  readonly district?: string;
  readonly area?: string;
  readonly minDistributionCount?: number;
  readonly maxDistributionCount?: number;
  readonly syncStatus?: string;
  readonly sortBy?: string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly page?: number;
  readonly limit?: number;
}
