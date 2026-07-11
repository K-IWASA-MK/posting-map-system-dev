// =========================================
// Generated: active/gas/06_dashboard.gs
// =========================================

// --- Source: src/application/dashboard/index.ts ---
* from './dto/DashboardDtos';
* from './services/DashboardApplicationService';


// --- Source: src/application/dashboard/dto/DashboardDtos.ts ---
interface PersonalDashboardDto {
  staffNo: string;
  displayName: string;
  holdingQuantity: number;
  monthlyDistributionQuantity: number;
}

interface StaffSummary {
  staffNo: string;
  displayName: string;
  holdingQuantity: number;
  monthlyDistributionQuantity: number;
  activityDays: number;
  activityIndex: number;
  cityName?: string;
}

interface NewStaffDto {
  staffNo: string;
  displayName: string;
  registeredAt: string;
  holdingQuantity: number;
  firstActivityDate: string;
}

interface WorkspaceDashboardDto {
  workspaceId: string;
  workspaceName: string;
  memberCount: number;
  newMemberCount: number;
  totalHoldingQuantity: number;
  monthlyDistributionQuantity: number;
  previousMonthDistributionQuantity: number;
  growthRate: string;
  members: StaffSummary[];
  newMembers: NewStaffDto[];
  monthlyTrend: { month: string; quantity: number }[];
  lineAppUrl: string;
  dashboardUrl: string;
}

interface RankingDto {
  rank: number;
  staffNo: string;
  displayName: string;
  quantity: number;
  activityIndex: number;
}

interface MonthlyActivitySummary {
  workspaceId: string;
  yearMonth: string;
  totalQuantity: number;
  ranking: RankingDto[];
}


// --- Source: src/application/dashboard/services/DashboardApplicationService.ts ---

class DashboardApplicationService {
  constructor(
    private workspaceRepo: IWorkspaceRepository,
    private staffRepo: IStaffRepository,
    private holdingRepo: IFlyerHoldingRepository,
    private activityRepo: IActivityRepository
  ) {}

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

  public async getWorkspaceDashboard(workspaceId: string, yearMonth?: string | YearMonth): Promise<WorkspaceDashboardDto> {
    const ws = await this.workspaceRepo.findById(workspaceId);
    const wsName = ws ? ws.workspaceName : '不明な支部';

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

    for (const staff of staffList) {
      const holding = await this.holdingRepo.findByStaffNo(staff.staffNo);
      const holdingQty = holding ? holding.getQuantity().getValue() : 0;

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
        cityName: holding ? holding.cityName : '-'
      });

      totalHolding += holdingQty;
      totalActivity += monthlyTotal;
      totalPrevActivity += prevMonthlyTotal;
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
    return {
      workspaceId,
      workspaceName: wsName,
      memberCount: staffList.length,
      newMemberCount: newMembers.length,
      totalHoldingQuantity: totalHolding,
      monthlyDistributionQuantity: totalActivity,
      previousMonthDistributionQuantity: totalPrevActivity,
      growthRate,
      members,
      newMembers,
      monthlyTrend,
      lineAppUrl: urls.lineAppUrl,
      dashboardUrl: urls.dashboardUrl
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


// --- Source: src/api/dashboard/DashboardHandler.ts ---

class DashboardHandler implements EndpointHandler {
  constructor(
    private dashboardAppService: DashboardApplicationService
  ) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (path.includes('/dashboard/me')) {
        const lineUserId = request.query.lineUserId;
        if (!lineUserId || lineUserId.trim().length === 0) {
          throw new Error('lineUserId is required');
        }

        const yearMonthParam = request.query.yearMonth;

        const dashboard = await this.dashboardAppService.getPersonalDashboardByLineUserId(lineUserId, yearMonthParam);
        const result = {
          name: dashboard.displayName,
          holding: dashboard.holdingQuantity,
          monthlyActivity: dashboard.monthlyDistributionQuantity
        };
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      if (path.includes('/dashboard/workspace/')) {
        const workspaceId = request.pathParams.id;
        if (!workspaceId || workspaceId.trim().length === 0) {
          throw new Error('workspaceId is required');
        }

        const yearMonthParam = request.query.yearMonth;

        const dashboard = await this.dashboardAppService.getWorkspaceDashboard(workspaceId, yearMonthParam);
        const result = {
          workspaceId: dashboard.workspaceId,
          name: dashboard.workspaceName,
          memberCount: dashboard.memberCount,
          newMemberCount: dashboard.newMemberCount,
          total: dashboard.totalHoldingQuantity,
          monthlyActivity: dashboard.monthlyDistributionQuantity,
          previousMonthActivity: dashboard.previousMonthDistributionQuantity,
          growthRate: dashboard.growthRate,
          members: dashboard.members,
          newMembers: dashboard.newMembers,
          monthlyTrend: dashboard.monthlyTrend,
          lineAppUrl: dashboard.lineAppUrl,
          dashboardUrl: dashboard.dashboardUrl
        };
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      if (path.includes('/dashboard/ranking')) {
        const workspaceId = request.query.workspaceId;
        if (!workspaceId || workspaceId.trim().length === 0) {
          throw new Error('workspaceId is required');
        }

        const yearMonthParam = request.query.yearMonth;

        const rankings = await this.dashboardAppService.getMonthlyRanking(workspaceId, yearMonthParam);
        const result = rankings.map(r => ({
          rank: r.rank,
          name: r.displayName,
          quantity: r.quantity,
          activityIndex: r.activityIndex
        }));
        return FieldApiMapper.toSuccessResponse(result, request, context);
      }

      throw new Error(`Unknown dashboard path: ${path}`);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}


