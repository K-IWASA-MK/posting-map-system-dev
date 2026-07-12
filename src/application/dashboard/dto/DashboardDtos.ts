import { EmailTemplateDto } from '../email/EmailTemplateDto';

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
  activityDays: number;
  activityIndex: number;
  cityName?: string;
}

export interface NewStaffDto {
  staffNo: string;
  displayName: string;
  registeredAt: string;
  holdingQuantity: number;
  firstActivityDate: string;
}

export interface WorkspaceDashboardDto {
  workspaceId: string;
  workspaceName: string;
  memberCount: number;
  newMemberCount: number;
  activeMemberCount: number;
  totalHoldingQuantity: number;
  monthlyDistributionQuantity: number;
  previousMonthDistributionQuantity: number;
  growthRate: string;
  members: StaffSummary[];
  newMembers: NewStaffDto[];
  monthlyTrend: { month: string; quantity: number }[];
  cityActivities: { cityName: string; quantity: number }[];
  distributionGoal?: number;
  achievementRate?: number;
  prevActiveMemberCount: number;
  volumeDifference: number;
  volumeGrowthRate: number;
  memberDifference: number;
  memberGrowthRate: number;
  topCityName: string;
  topCityQuantity: number;
  activeCityCount: number;
  lineAppUrl: string;
  dashboardUrl: string;
  emailTemplates: EmailTemplateDto[];
}

export interface RankingDto {
  rank: number;
  staffNo: string;
  displayName: string;
  quantity: number;
  activityIndex: number;
}

export interface MonthlyActivitySummary {
  workspaceId: string;
  yearMonth: string;
  totalQuantity: number;
  ranking: RankingDto[];
}
