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
}

interface NewStaffDto {
  staffNo: string;
  displayName: string;
  registeredAt: string;
  holdingQuantity: number;
}

interface WorkspaceDashboardDto {
  workspaceId: string;
  workspaceName: string;
  members: StaffSummary[];
  newMembers: NewStaffDto[];
  totalHoldingQuantity: number;
  monthlyDistributionQuantity: number;
}

interface RankingDto {
  rank: number;
  staffNo: string;
  displayName: string;
  quantity: number;
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

    // Calculate monthly activity from logs
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
    const yearMonthObj = typeof yearMonth === 'string' ? new YearMonth(yearMonth) : (yearMonth || new YearMonth(new Date()));

    const { start, end } = { start: yearMonthObj.getStartDate(), end: yearMonthObj.getEndDate() };
    const allActivities = await this.activityRepo.findByPeriod(start, end);

    const members: StaffSummary[] = [];
    let totalHolding = 0;
    let totalActivity = 0;

    for (const staff of staffList) {
      const holding = await this.holdingRepo.findByStaffNo(staff.staffNo);
      const holdingQty = holding ? holding.getQuantity().getValue() : 0;

      const staffActivities = allActivities.filter(a => a.staffNo === staff.staffNo);
      const monthlyTotal = staffActivities.reduce((sum, a) => sum + a.reportedQuantity.getValue(), 0);

      members.push({
        staffNo: staff.staffNo,
        displayName: staff.displayName,
        holdingQuantity: holdingQty,
        monthlyDistributionQuantity: monthlyTotal
      });

      totalHolding += holdingQty;
      totalActivity += monthlyTotal;
    }

    const newStaffList = await this.staffRepo.findNewStaffByMonth(workspaceId, yearMonthObj);
    const newMembers: NewStaffDto[] = [];
    
    for (const staff of newStaffList) {
      const holding = await this.holdingRepo.findByStaffNo(staff.staffNo);
      const holdingQty = holding ? holding.getQuantity().getValue() : 0;
      newMembers.push({
        staffNo: staff.staffNo,
        displayName: staff.displayName,
        registeredAt: this.formatDate(staff.createdAt),
        holdingQuantity: holdingQty
      });
    }

    return {
      workspaceId,
      workspaceName: wsName,
      members,
      newMembers,
      totalHoldingQuantity: totalHolding,
      monthlyDistributionQuantity: totalActivity
    };
  }

  public async getMonthlyRanking(workspaceId: string, yearMonth?: string | YearMonth): Promise<RankingDto[]> {
    const dashboard = await this.getWorkspaceDashboard(workspaceId, yearMonth);
    
    // Sort members based strictly on monthly distribution quantity descending
    const sorted = [...dashboard.members].sort(
      (a, b) => b.monthlyDistributionQuantity - a.monthlyDistributionQuantity
    );

    return sorted.map((item, idx) => ({
      rank: idx + 1,
      staffNo: item.staffNo,
      displayName: item.displayName,
      quantity: item.monthlyDistributionQuantity
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
          name: dashboard.workspaceName,
          total: dashboard.totalHoldingQuantity,
          monthlyActivity: dashboard.monthlyDistributionQuantity,
          members: dashboard.members,
          newMembers: dashboard.newMembers
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
          quantity: r.quantity
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


