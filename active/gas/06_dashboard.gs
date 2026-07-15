// =========================================
// Generated: active/gas/06_dashboard.gs
// =========================================

// --- Source: projects/posting-map/src/application/dashboard/index.ts ---
* from './dto/DashboardDtos';
* from './services/DashboardApplicationService';


// --- Source: projects/posting-map/src/application/dashboard/dto/DashboardDtos.ts ---

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
  performanceMetrics?: PerformanceMetricsDto;
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


// --- Source: projects/posting-map/src/application/dashboard/dto/DashboardFactDto.ts ---
interface DashboardFactDto {
  readonly id: string;
  readonly date: string;
  readonly district: string;
  readonly area: string;
  readonly distributionCount: number;
  readonly syncStatus: string;
  readonly gpsEvidence: string | null;
  readonly photoEvidence: string | null;
}


// --- Source: projects/posting-map/src/application/dashboard/dto/DashboardFilterDto.ts ---
interface DashboardFilterDto {
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


// --- Source: projects/posting-map/src/application/dashboard/dto/FlyerHoldingDto.ts ---
interface FlyerHoldingDto {
  readonly holdingId: string;
  readonly workspaceId: string;
  readonly location: string; // 保管場所
  readonly keeper: string; // 保管者
  readonly currentHoldings: number; // 現在保有枚数
  readonly updatedAt: string; // 更新日時 (ISO 8601 string)
}


// --- Source: projects/posting-map/src/application/dashboard/dto/PerformanceMetricsDto.ts ---
interface PerformanceMetricsDto {
  responseTimeMs: number;
  spreadsheetReadCount: number;
  spreadsheetWriteCount: number;
  repositoryCallCount: number;
  repositoryExecutionCount: Array<{ repositoryName: string; executionCount: number }>;
  sheetMetrics: Array<{ sheetName: string; readCount: number; writeCount: number }>;
  activityRecordCount: number;
  holdingRecordCount: number;
  staffRecordCount: number;
  generatedAt: string;
  apiVersion: string;
  dashboardVersion: string;
}


// --- Source: projects/posting-map/src/application/dashboard/email/EmailTemplateDto.ts ---
interface EmailTemplateDto {
  templateId: string;
  templateName: string;
  subject: string;
  body: string;
  enabled: boolean;
}


// --- Source: projects/posting-map/src/application/dashboard/email/EmailTemplateService.ts ---

class EmailTemplateService {
  private reader: SpreadsheetReader;
  private sheetName = 'メールテンプレート';

  constructor() {
    this.reader = new SpreadsheetReader();
  }

  public async getActiveTemplates(): Promise<EmailTemplateDto[]> {
    try {
      const rows = this.reader.readAll(this.sheetName);
      if (!rows || rows.length <= 1) return this.getDefaultTemplates();

      const headers = rows[0];
      const idIdx = headers.indexOf('templateId');
      const nameIdx = headers.indexOf('templateName');
      const subjectIdx = headers.indexOf('subject');
      const bodyIdx = headers.indexOf('body');
      const enabledIdx = headers.indexOf('enabled');

      if (idIdx === -1) return this.getDefaultTemplates();

      const templates: EmailTemplateDto[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[idIdx] || String(row[idIdx]).trim().length === 0) continue;
        
        const enabled = enabledIdx !== -1 
          ? String(row[enabledIdx]).trim().toLowerCase() === 'true' 
          : true;
        
        if (!enabled) continue;

        templates.push({
          templateId: String(row[idIdx]).trim(),
          templateName: nameIdx !== -1 ? String(row[nameIdx]).trim() : '',
          subject: subjectIdx !== -1 ? String(row[subjectIdx]).trim() : '',
          body: bodyIdx !== -1 ? String(row[bodyIdx]) : '',
          enabled
        });
      }

      if (templates.length === 0) {
        return this.getDefaultTemplates();
      }
      return templates;
    } catch (e) {
      // Fallback to default templates if the sheet does not exist or read fails
      return this.getDefaultTemplates();
    }
  }

  private getDefaultTemplates(): EmailTemplateDto[] {
    return [
      {
        templateId: 'MAIL001',
        templateName: '参加案内メール',
        subject: 'ポスティング活動に参加のお願い',
        body: `党員さん、サポーターさんへ

ポスティング活動へのご協力のお願いです。

{{workspaceName}}では、
地域で協力してポスティング活動を進めるため、
POSTING MAPを導入しました。

また、チラシを保管してご協力いただける方は、
{{workspaceName}}までご連絡ください。

POSTING MAPでは、

「どこで」
「誰が」
「何枚持っているか」

を支部内で共有し、
協力しながらポスティング活動を進めることができます。

以下のLINE URLから登録をお願いします。

▼POSTING MAP参加入口

{{lineAppUrl}}

登録後、POSTING MAPを利用して
ポスティング活動に参加できます。

皆さんで協力して、
地域で継続できるポスティング活動を作っていきましょう。

{{workspaceName}}`,
        enabled: true
      },
      {
        templateId: 'MAIL002',
        templateName: 'チラシ保有協力お願いメール',
        subject: 'チラシ保有ご協力のお願い',
        body: `党員さん、サポーターさんへ

チラシの保有についてのご協力のお願いです。

{{workspaceName}}では、
ポスティング活動で使用するチラシを保有して
ご協力いただける方を募集しています。

ご協力いただける方は、{{workspaceName}}までご連絡いただくか、以下のLINE URLから登録を行ってください。

▼POSTING MAP登録入口

{{lineAppUrl}}

登録後、市町村ごとのチラシ保有状況を支部内で共有し、効率的にポスティング活動を進めることができます。

どうぞよろしくお願いいたします。

{{workspaceName}}`,
        enabled: true
      }
    ];
  }
}


// --- Source: projects/posting-map/src/application/dashboard/services/DashboardApplicationService.ts ---


class DashboardApplicationService {
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
    const t0 = Date.now();
    let stats = { staffRead: 1, holdingRead: 1, activityRead: 1, totalAccess: 3 };

    const staff = await this.staffRepo.findByStaffNo(staffNo);
    if (!staff) {
      throw new Error(`Staff not found: ${staffNo}`);
    }

    const allHoldings = await this.holdingRepo.findAll();
    const holding = allHoldings.find(h => h.staffNo === staffNo);
    const holdingQty = holding ? holding.getQuantity().getValue() : 0;

    const yearMonthObj = typeof yearMonth === 'string' ? new YearMonth(yearMonth) : yearMonth;

    const { start, end } = yearMonthObj 
      ? { start: yearMonthObj.getStartDate(), end: yearMonthObj.getEndDate() }
      : this.getCurrentMonthRange();

    const allActivitiesRaw = await this.activityRepo.findAll();
    const allActivities = allActivitiesRaw.filter(a => a.occurredAt.getTime() >= start.getTime() && a.occurredAt.getTime() <= end.getTime());
    
    const staffActivities = allActivities.filter(a => a.staffNo === staffNo);
    const monthlyTotal = staffActivities.reduce((sum, a) => sum + a.reportedQuantity.getValue(), 0);

    const t1 = Date.now();
    console.log(`[Personal Dashboard Performance] Activity Read : ${stats.activityRead}, Holding Read : ${stats.holdingRead}, Staff Read : ${stats.staffRead}, Spreadsheet Access : ${stats.totalAccess}, Processing Time : ${t1 - t0}ms`);

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
    const t0 = Date.now();
    const stats = { workspaceRead: 1, staffRead: 1, holdingRead: 1, activityRead: 1, totalAccess: 4 };

    const ws = await this.workspaceRepo.findById(workspaceId);
    const wsName = ws ? ws.workspaceName : '不明な支部';
    const distributionGoal = ws ? (ws.getDistributionGoal() ?? undefined) : undefined;

    const staffList = await this.staffRepo.findByWorkspace(workspaceId);
    const staffIds = staffList.map(s => s.staffNo);
    const yearMonthObj = typeof yearMonth === 'string' ? new YearMonth(yearMonth) : (yearMonth || new YearMonth(new Date()));

    // --- Performance Foundation: 一括取得とメモリ処理への移行 ---
    const allHoldings = await this.holdingRepo.findAll();
    const holdingMap = new Map<string, any>();
    for (const h of allHoldings) {
      holdingMap.set(h.staffNo, h);
    }

    const allActivitiesRaw = await this.activityRepo.findAll();

    // Current month range
    const { start, end } = { start: yearMonthObj.getStartDate(), end: yearMonthObj.getEndDate() };
    const allActivities = allActivitiesRaw.filter(a => a.occurredAt.getTime() >= start.getTime() && a.occurredAt.getTime() <= end.getTime());

    // Previous month range
    const prevMonthObj = yearMonthObj.getMonth() === 1
      ? new YearMonth(`${yearMonthObj.getYear() - 1}12`)
      : new YearMonth(`${yearMonthObj.getYear()}${String(yearMonthObj.getMonth() - 1).padStart(2, '0')}`);
    const { start: pStart, end: pEnd } = { start: prevMonthObj.getStartDate(), end: prevMonthObj.getEndDate() };
    const prevActivities = allActivitiesRaw.filter(a => a.occurredAt.getTime() >= pStart.getTime() && a.occurredAt.getTime() <= pEnd.getTime());

    // Fetch all activities for firstActivityDate lookup
    const allTimeActivities = allActivitiesRaw;

    const members: StaffSummary[] = [];
    let totalHolding = 0;
    let totalActivity = 0;
    let totalPrevActivity = 0;
    let activeMemberCount = 0;
    const cityMap = new Map<string, number>();

    for (const staff of staffList) {
      const holding = holdingMap.get(staff.staffNo);
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

    // New members compilation (Avoid N+1 Database Queries by filtering in memory)
    const newStaffList = staffList.filter(s => s.createdAt.getTime() >= start.getTime() && s.createdAt.getTime() <= end.getTime());
    const newMembers: NewStaffDto[] = [];
    
    for (const staff of newStaffList) {
      const holding = holdingMap.get(staff.staffNo);
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
      const tempActs = allActivitiesRaw.filter(a => a.occurredAt.getTime() >= tStart.getTime() && a.occurredAt.getTime() <= tEnd.getTime());
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
    
    const t1 = Date.now();
    const profilerMetrics = RepositoryPerformanceProfiler.getInstance().getMetrics();
    const performanceMetrics = {
      responseTimeMs: t1 - t0,
      spreadsheetReadCount: profilerMetrics.spreadsheetReadCount,
      spreadsheetWriteCount: profilerMetrics.spreadsheetWriteCount,
      repositoryCallCount: profilerMetrics.repositoryCallCount,
      repositoryExecutionCount: profilerMetrics.repositoryExecutionCount,
      sheetMetrics: profilerMetrics.sheetMetrics,
      activityRecordCount: allActivitiesRaw.length,
      holdingRecordCount: allHoldings.length,
      staffRecordCount: staffList.length,
      generatedAt: new Date().toISOString(),
      apiVersion: '1.0',
      dashboardVersion: 'v2.4'
    };

    console.log(`[Dashboard Performance] Activity Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Activity')?.readCount || 0}, Holding Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Flyers')?.readCount || 0}, Staff Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Staff')?.readCount || 0}, Workspace Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Workspaces')?.readCount || 0}, Spreadsheet Access : ${profilerMetrics.spreadsheetReadCount + profilerMetrics.spreadsheetWriteCount}, Processing Time : ${t1 - t0}ms`);

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
      emailTemplates,
      performanceMetrics
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


// --- Source: projects/posting-map/src/application/dashboard/services/DashboardFactService.ts ---

class DashboardFactService {
  constructor(
    private activityRepo: IActivityRepository,
    private holdingRepo: IFlyerHoldingRepository
  ) {}

  public async getDistributionFacts(filter: DashboardFilterDto): Promise<{ items: DashboardFactDto[], totalCount: number }> {
    const activities = await this.activityRepo.findAll();

    // Filtering
    let filtered = activities.filter(activity => {
      const dto = this.mapToFactDto(activity);
      
      if (filter.date && dto.date !== filter.date) return false;
      if (filter.district && dto.district !== filter.district) return false;
      if (filter.area && dto.area !== filter.area) return false;
      if (filter.minDistributionCount !== undefined && dto.distributionCount < filter.minDistributionCount) return false;
      if (filter.maxDistributionCount !== undefined && dto.distributionCount > filter.maxDistributionCount) return false;
      if (filter.syncStatus && dto.syncStatus !== filter.syncStatus) return false;
      
      return true;
    });

    // Sorting
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const dtoA = this.mapToFactDto(a);
        const dtoB = this.mapToFactDto(b);
        const valA = (dtoA as any)[filter.sortBy!] || '';
        const valB = (dtoB as any)[filter.sortBy!] || '';

        if (valA < valB) return filter.sortDirection === 'desc' ? 1 : -1;
        if (valA > valB) return filter.sortDirection === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const totalCount = filtered.length;

    // Pagination
    if (filter.page !== undefined && filter.limit !== undefined) {
      const startIndex = (filter.page - 1) * filter.limit;
      filtered = filtered.slice(startIndex, startIndex + filter.limit);
    }

    const items = filtered.map(a => this.mapToFactDto(a));
    return { items, totalCount };
  }

  public async getFactDetail(id: string): Promise<DashboardFactDto | null> {
    const activity = await this.activityRepo.findById(id);
    if (!activity) return null;
    return this.mapToFactDto(activity);
  }

  public async getFlyerHoldings(): Promise<FlyerHoldingDto[]> {
    const holdings = await this.holdingRepo.findAll();
    return holdings.map(h => this.mapToHoldingDto(h));
  }

  public async addFlyerHolding(dto: FlyerHoldingDto): Promise<void> {
    const holding = new FlyerHolding({
      staffNo: dto.keeper,
      quantity: new Quantity(dto.currentHoldings),
      updatedAt: new Date(dto.updatedAt),
      cityName: dto.location
    });
    await this.holdingRepo.save(holding);
  }

  public async updateFlyerHolding(dto: FlyerHoldingDto): Promise<void> {
    const holding = new FlyerHolding({
      staffNo: dto.keeper,
      quantity: new Quantity(dto.currentHoldings),
      updatedAt: new Date(dto.updatedAt),
      cityName: dto.location
    });
    await this.holdingRepo.save(holding);
  }

  public async deleteFlyerHolding(keeper: string): Promise<void> {
    await this.holdingRepo.delete(keeper);
  }

  private mapToFactDto(activity: DistributionActivity): DashboardFactDto {
    const dt = activity.occurredAt;
    const dateStr = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
    
    return {
      id: activity.id,
      date: dateStr,
      district: '-', // Activity does not track workspace directly
      area: activity.areaId ? activity.areaId.getValue() : '-',
      distributionCount: activity.reportedQuantity.getValue(),
      syncStatus: activity.getStatus() === 'COMPLETED' ? 'SYNCED' : 'UNSYNCED',
      gpsEvidence: activity.gpsEvidence?.location ? `${activity.gpsEvidence.location.latitude},${activity.gpsEvidence.location.longitude}` : null,
      photoEvidence: activity.photoEvidence?.photoUrl || null
    };
  }

  private mapToHoldingDto(holding: FlyerHolding): FlyerHoldingDto {
    return {
      holdingId: holding.staffNo,
      workspaceId: 'DEFAULT', // Simplified for single-tenant or handled externally
      location: holding.cityName,
      keeper: holding.staffNo,
      currentHoldings: holding.getQuantity().getValue(),
      updatedAt: holding.getUpdatedAt().toISOString()
    };
  }
}


// --- Source: projects/posting-map/src/api/dashboard/DashboardFactHandler.ts ---

class DashboardFactHandler implements EndpointHandler {
  constructor(private service: DashboardFactService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const path = request.path;

      if (request.method === 'GET') {
        if (path === '/dashboard/facts') {
          const filter: DashboardFilterDto = {
            date: request.query.date,
            district: request.query.district,
            area: request.query.area,
            minDistributionCount: request.query.minCount ? Number(request.query.minCount) : undefined,
            maxDistributionCount: request.query.maxCount ? Number(request.query.maxCount) : undefined,
            syncStatus: request.query.syncStatus,
            sortBy: request.query.sortBy,
            sortDirection: request.query.sortDirection as 'asc' | 'desc',
            page: request.query.page ? Number(request.query.page) : undefined,
            limit: request.query.limit ? Number(request.query.limit) : undefined
          };
          const result = await this.service.getDistributionFacts(filter);
          return FieldApiMapper.toSuccessResponse(result, request, context);
        }

        if (path.match(/^\/dashboard\/facts\/detail\/.+$/)) {
          const id = path.split('/').pop()!;
          if (!id) throw new Error('ID is required');
          const result = await this.service.getFactDetail(id);
          return FieldApiMapper.toSuccessResponse(result, request, context);
        }

        if (path === '/dashboard/holdings') {
          const result = await this.service.getFlyerHoldings();
          return FieldApiMapper.toSuccessResponse(result, request, context);
        }
      }

      if (request.method === 'POST') {
        let payload: any = request.body || {};

        if (path === '/dashboard/holdings/add') {
          await this.service.addFlyerHolding(payload.dto);
          return FieldApiMapper.toSuccessResponse({ success: true }, request, context);
        }

        if (path === '/dashboard/holdings/update') {
          await this.service.updateFlyerHolding(payload.dto);
          return FieldApiMapper.toSuccessResponse({ success: true }, request, context);
        }

        if (path === '/dashboard/holdings/delete') {
          await this.service.deleteFlyerHolding(payload.keeper);
          return FieldApiMapper.toSuccessResponse({ success: true }, request, context);
        }
      }

      throw new Error(`Unknown dashboard fact path or method: ${request.method} ${path}`);
    } catch (error: any) {
      console.error('[DashboardFactHandler] Error:', error);
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    } finally {
      RepositoryPerformanceProfiler.getInstance().reset();
    }
  }
}


// --- Source: projects/posting-map/src/api/dashboard/DashboardHandler.ts ---

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
          activeMemberCount: dashboard.activeMemberCount,
          total: dashboard.totalHoldingQuantity,
          monthlyActivity: dashboard.monthlyDistributionQuantity,
          previousMonthActivity: dashboard.previousMonthDistributionQuantity,
          growthRate: dashboard.growthRate,
          members: dashboard.members,
          newMembers: dashboard.newMembers,
          monthlyTrend: dashboard.monthlyTrend,
          cityActivities: dashboard.cityActivities,
          distributionGoal: dashboard.distributionGoal,
          achievementRate: dashboard.achievementRate,
          prevActiveMemberCount: dashboard.prevActiveMemberCount,
          volumeDifference: dashboard.volumeDifference,
          volumeGrowthRate: dashboard.volumeGrowthRate,
          memberDifference: dashboard.memberDifference,
          memberGrowthRate: dashboard.memberGrowthRate,
          topCityName: dashboard.topCityName,
          topCityQuantity: dashboard.topCityQuantity,
          activeCityCount: dashboard.activeCityCount,
          lineAppUrl: dashboard.lineAppUrl,
          dashboardUrl: dashboard.dashboardUrl,
          emailTemplates: dashboard.emailTemplates,
          performanceMetrics: dashboard.performanceMetrics
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
    } finally {
      RepositoryPerformanceProfiler.getInstance().reset();
    }
  }
}


