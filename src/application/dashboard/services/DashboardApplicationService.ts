import { IStaffRepository } from '@domain/field/staff/repositories/IStaffRepository';
import { IFlyerHoldingRepository } from '@domain/field/holding/repositories/IFlyerHoldingRepository';
import { IActivityRepository } from '@domain/field/activity/repositories/IActivityRepository';
import { IWorkspaceRepository } from '@domain/workspace/repositories/IWorkspaceRepository';
import { WorkspaceUrl } from '@domain/workspace/valueobjects/WorkspaceUrl';
import { YearMonth } from '../../../domain/common/valueobjects/YearMonth';
import { 
  PersonalDashboardDto, 
  WorkspaceDashboardDto, 
  RankingDto, 
  StaffSummary, 
  NewStaffDto, 
  MonthlyActivitySummary 
} from '../dto/DashboardDtos';

import { EmailTemplateService } from '../email/EmailTemplateService';

export class DashboardApplicationService {
  private emailTemplateService: EmailTemplateService;

  constructor(
    private workspaceRepo: IWorkspaceRepository,
    private staffRepo: IStaffRepository,
    private holdingRepo: IFlyerHoldingRepository,
    private activityRepo: IActivityRepository
  ) {
    this.emailTemplateService = new EmailTemplateService();
  }

  public async getPersonalDashboardByLineUserId(lineUserId: string, yearMonth?: string | YearMonth): Promise<PersonalDashboardDto> {
    const staff = await this.staffRepo.findByLineUserId(lineUserId);
    if (!staff) {
      throw new Error(`Staff not found for lineUserId: ${lineUserId}`);
    }
    return this.getPersonalDashboard(staff.staffNo, yearMonth);
  }

  public async getPersonalDashboard(staffNo: string, yearMonth?: string | YearMonth): Promise<PersonalDashboardDto> {
    const staff = await this.staffRepo.findByStaffNo(staffNo);
    if (!staff) {
      throw new Error(`Staff not found: ${staffNo}`);
    }

    const holding = await this.holdingRepo.findByStaffNo(staffNo);
    const holdingQty = holding ? holding.getQuantity().getValue() : 0;

    const yearMonthObj = typeof yearMonth === 'string' ? new YearMonth(yearMonth) : yearMonth;

    const { start, end } = yearMonthObj 
      ? { start: yearMonthObj.getStartDate(), end: yearMonthObj.getEndDate() }
      : this.getCurrentMonthRange();

    const allActivities = await this.activityRepo.findByPeriod(start, end);
    const staffActivities = allActivities.filter(a => a.staffNo === staffNo);
    const monthlyTotal = staffActivities.reduce((sum, a) => sum + a.reportedQuantity.getValue(), 0);

    return {
      staffNo: staff.staffNo,
      displayName: staff.displayName,
      holdingQuantity: holdingQty,
      monthlyDistributionQuantity: monthlyTotal
    };
  }

  public async getWorkspaceDashboard(
    workspaceId: string,
    yearMonth?: string | YearMonth
  ): Promise<WorkspaceDashboardDto> {
    const ws = await this.workspaceRepo.findById(workspaceId);
    const wsName = ws ? ws.workspaceName : '不明な支部';
    const distributionGoal = ws ? (ws.getDistributionGoal() ?? undefined) : undefined;

    const staffList = await this.staffRepo.findByWorkspace(workspaceId);
    const staffIds = staffList.map(s => s.staffNo);
    const yearMonthObj = typeof yearMonth === 'string' ? new YearMonth(yearMonth) : (yearMonth || new YearMonth(new Date()));

    // Current month range
    const { start, end } = { start: yearMonthObj.getStartDate(), end: yearMonthObj.getEndDate() };
    const allActivities = await this.activityRepo.findByPeriod(start, end);

    // Previous month range
    const prevMonthObj = yearMonthObj.getMonth() === 1
      ? new YearMonth(`${yearMonthObj.getYear() - 1}12`)
      : new YearMonth(`${yearMonthObj.getYear()}${String(yearMonthObj.getMonth() - 1).padStart(2, '0')}`);
    const { start: pStart, end: pEnd } = { start: prevMonthObj.getStartDate(), end: prevMonthObj.getEndDate() };
    const prevActivities = await this.activityRepo.findByPeriod(pStart, pEnd);

    // Fetch all activities for firstActivityDate lookup
    const allTimeActivities = await this.activityRepo.findByPeriod(new Date(2000, 0, 1), new Date(2100, 0, 1));

    const members: StaffSummary[] = [];
    let totalHolding = 0;
    let totalActivity = 0;
    let totalPrevActivity = 0;
    let activeMemberCount = 0;
    const cityMap = new Map<string, number>();

    for (const staff of staffList) {
      const holding = await this.holdingRepo.findByStaffNo(staff.staffNo);
      const holdingQty = holding ? holding.getQuantity().getValue() : 0;
      const cityName = holding ? holding.cityName : '-';

      // Current month activity
      const staffActivities = allActivities.filter(a => a.staffNo === staff.staffNo);
      const monthlyTotal = staffActivities.reduce((sum, a) => sum + a.reportedQuantity.getValue(), 0);

      // Previous month activity
      const staffPrevActivities = prevActivities.filter(a => a.staffNo === staff.staffNo);
      const prevMonthlyTotal = staffPrevActivities.reduce((sum, a) => sum + a.reportedQuantity.getValue(), 0);

      // Activity Index calculations
      const uniqueDays = new Set(staffActivities.map(a => {
        const d = a.occurredAt;
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      })).size;
      const isNewStaff = staff.createdAt.getTime() >= start.getTime() && staff.createdAt.getTime() <= end.getTime();
      const actIndex = monthlyTotal + (uniqueDays * 100) + (isNewStaff ? 500 : 0);

      members.push({
        staffNo: staff.staffNo,
        displayName: staff.displayName,
        holdingQuantity: holdingQty,
        monthlyDistributionQuantity: monthlyTotal,
        activityDays: uniqueDays,
        activityIndex: actIndex,
        cityName
      });

      totalHolding += holdingQty;
      totalActivity += monthlyTotal;
      totalPrevActivity += prevMonthlyTotal;

      if (monthlyTotal > 0) {
        activeMemberCount++;
        const currentCityQty = cityMap.get(cityName) || 0;
        cityMap.set(cityName, currentCityQty + monthlyTotal);
      }
    }

    // Sort rankings by monthlyDistributionQuantity descending (criteria is distribution volume)
    members.sort((a, b) => b.monthlyDistributionQuantity - a.monthlyDistributionQuantity);

    // Calculate growth rate
    let growthRate = '0%';
    if (totalPrevActivity > 0) {
      const rate = ((totalActivity - totalPrevActivity) / totalPrevActivity) * 100;
      growthRate = rate >= 0 ? `+${Math.round(rate)}%` : `${Math.round(rate)}%`;
    } else if (totalActivity > 0) {
      growthRate = '+100%';
    }

    // Convert cityMap to sorted array
    const cityActivities = Array.from(cityMap.entries())
      .map(([name, qty]) => ({ cityName: name, quantity: qty }))
      .sort((a, b) => b.quantity - a.quantity);

    // 1. Calculate Monthly Goal Achievement Rate
    let achievementRate: number | undefined = undefined;
    if (distributionGoal && distributionGoal > 0) {
      achievementRate = Math.round((totalActivity / distributionGoal) * 100);
    }

    // 2. Calculate Month-over-Month comparison for active members
    const prevActiveStaffs = new Set<string>();
    prevActivities.forEach(a => {
      if (a.reportedQuantity.getValue() > 0 && staffIds.indexOf(a.staffNo) !== -1) {
        prevActiveStaffs.add(a.staffNo);
      }
    });
    const prevActiveMemberCount = prevActiveStaffs.size;

    // 3. Month-over-Month volume difference and growth rate
    const volumeDifference = totalActivity - totalPrevActivity;
    let volumeGrowthRate = 0;
    if (totalPrevActivity > 0) {
      volumeGrowthRate = Math.round((volumeDifference / totalPrevActivity) * 100);
    } else if (totalActivity > 0) {
      volumeGrowthRate = 100;
    }

    // 4. Month-over-Month member difference and growth rate
    const memberDifference = activeMemberCount - prevActiveMemberCount;
    let memberGrowthRate = 0;
    if (prevActiveMemberCount > 0) {
      memberGrowthRate = Math.round((memberDifference / prevActiveMemberCount) * 100);
    } else if (activeMemberCount > 0) {
      memberGrowthRate = 100;
    }

    // 5. Identify top active city
    const topCityName = cityActivities.length > 0 ? cityActivities[0].cityName : '-';
    const topCityQuantity = cityActivities.length > 0 ? cityActivities[0].quantity : 0;

    // 6. Active city count
    const activeCityCount = cityActivities.length;

    // New members compilation
    const newStaffList = await this.staffRepo.findNewStaffByMonth(workspaceId, yearMonthObj);
    const newMembers: NewStaffDto[] = [];
    
    for (const staff of newStaffList) {
      const holding = await this.holdingRepo.findByStaffNo(staff.staffNo);
      const holdingQty = holding ? holding.getQuantity().getValue() : 0;

      // Find first activity date
      const staffActs = allTimeActivities.filter(a => a.staffNo === staff.staffNo);
      let firstActivityDate = 'なし';
      if (staffActs.length > 0) {
        const oldest = staffActs.reduce((oldestAct, currentAct) => {
          return currentAct.occurredAt.getTime() < oldestAct.occurredAt.getTime() ? currentAct : oldestAct;
        });
        firstActivityDate = this.formatDate(oldest.occurredAt);
      }

      newMembers.push({
        staffNo: staff.staffNo,
        displayName: staff.displayName,
        registeredAt: this.formatDate(staff.createdAt),
        holdingQuantity: holdingQty,
        firstActivityDate
      });
    }

    // 6-month monthly trend
    const monthlyTrend: { month: string; quantity: number }[] = [];
    let tempYM = yearMonthObj;
    for (let i = 0; i < 6; i++) {
      const { start: tStart, end: tEnd } = { start: tempYM.getStartDate(), end: tempYM.getEndDate() };
      const tempActs = await this.activityRepo.findByPeriod(tStart, tEnd);
      const wsTempActs = tempActs.filter(a => staffIds.indexOf(a.staffNo) !== -1);
      const tempTotal = wsTempActs.reduce((sum, a) => sum + a.reportedQuantity.getValue(), 0);

      monthlyTrend.unshift({
        month: `${tempYM.getMonth()}月`,
        quantity: tempTotal
      });

      // Move to previous month
      tempYM = tempYM.getMonth() === 1
        ? new YearMonth(`${tempYM.getYear() - 1}12`)
        : new YearMonth(`${tempYM.getYear()}${String(tempYM.getMonth() - 1).padStart(2, '0')}`);
    }

    const urls = WorkspaceUrl.generate(workspaceId);
    const emailTemplates = await this.emailTemplateService.getActiveTemplates();
    return {
      workspaceId,
      workspaceName: wsName,
      memberCount: staffList.length,
      newMemberCount: newMembers.length,
      activeMemberCount,
      totalHoldingQuantity: totalHolding,
      monthlyDistributionQuantity: totalActivity,
      previousMonthDistributionQuantity: totalPrevActivity,
      growthRate,
      members,
      newMembers,
      monthlyTrend,
      cityActivities,
      distributionGoal,
      achievementRate,
      prevActiveMemberCount,
      volumeDifference,
      volumeGrowthRate,
      memberDifference,
      memberGrowthRate,
      topCityName,
      topCityQuantity,
      activeCityCount,
      lineAppUrl: urls.lineAppUrl,
      dashboardUrl: urls.dashboardUrl,
      emailTemplates
    };
  }

  public async getMonthlyRanking(workspaceId: string, yearMonth?: string | YearMonth): Promise<RankingDto[]> {
    const dashboard = await this.getWorkspaceDashboard(workspaceId, yearMonth);
    return dashboard.members.map((item, idx) => ({
      rank: idx + 1,
      staffNo: item.staffNo,
      displayName: item.displayName,
      quantity: item.monthlyDistributionQuantity,
      activityIndex: item.activityIndex
    }));
  }

  public async getMonthlyActivitySummary(workspaceId: string, yearMonth: string | YearMonth): Promise<MonthlyActivitySummary> {
    const yearMonthObj = typeof yearMonth === 'string' ? new YearMonth(yearMonth) : yearMonth;
    const ranking = await this.getMonthlyRanking(workspaceId, yearMonthObj);
    const totalQuantity = ranking.reduce((sum, r) => sum + r.quantity, 0);
    return {
      workspaceId,
      yearMonth: yearMonthObj.toString(),
      totalQuantity,
      ranking
    };
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  private getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
}
