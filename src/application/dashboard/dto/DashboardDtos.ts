export interface PersonalDashboardDto {
  staffNo: string;
  displayName: string;
  holdingQuantity: number;
  monthlyDistributionQuantity: number;
}

export interface StaffSummary {
  staffNo: string;
  displayName: string;
  holdingQuantity: number;
  monthlyDistributionQuantity: number;
}

export interface NewStaffDto {
  staffNo: string;
  displayName: string;
  registeredAt: string;
  holdingQuantity: number;
}

export interface WorkspaceDashboardDto {
  workspaceId: string;
  workspaceName: string;
  members: StaffSummary[];
  newMembers: NewStaffDto[];
  totalHoldingQuantity: number;
  monthlyDistributionQuantity: number;
}

export interface RankingDto {
  rank: number;
  staffNo: string;
  displayName: string;
  quantity: number;
}

export interface MonthlyActivitySummary {
  workspaceId: string;
  yearMonth: string;
  totalQuantity: number;
  ranking: RankingDto[];
}
