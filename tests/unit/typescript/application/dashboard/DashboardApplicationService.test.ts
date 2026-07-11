import { DashboardApplicationService } from '@application/dashboard/services/DashboardApplicationService';
import { IWorkspaceRepository } from '@domain/workspace/repositories/IWorkspaceRepository';
import { Workspace } from '@domain/workspace/entities/Workspace';
import { IStaffRepository } from '@domain/field/staff/repositories/IStaffRepository';
import { Staff } from '@domain/field/staff/entities/Staff';
import { IFlyerHoldingRepository } from '@domain/field/holding/repositories/IFlyerHoldingRepository';
import { FlyerHolding } from '@domain/field/holding/entities/FlyerHolding';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { Location } from '@domain/field/valueobjects/Location';
import { IActivityRepository } from '@domain/field/activity/repositories/IActivityRepository';
import { DistributionActivity } from '@domain/field/activity/entities/DistributionActivity';
import { YearMonth } from '../../../../../src/domain/common/valueobjects/YearMonth';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockWorkspaceRepository implements IWorkspaceRepository {
  public db = new Map<string, Workspace>();
  async findById(id: string): Promise<Workspace | undefined> {
    return this.db.get(id);
  }
  async findAll(): Promise<Workspace[]> {
    return Array.from(this.db.values());
  }
  async save(ws: Workspace): Promise<void> {
    this.db.set(ws.workspaceId, ws);
  }
}

class MockStaffRepository implements IStaffRepository {
  public db = new Map<string, Staff>();
  async findByStaffNo(staffNo: string): Promise<Staff | undefined> {
    return this.db.get(staffNo);
  }
  async findByLineUserId(lineUserId: string): Promise<Staff | undefined> {
    return Array.from(this.db.values()).find(s => s.lineUserId === lineUserId);
  }
  async findByWorkspace(workspaceId: string): Promise<Staff[]> {
    return Array.from(this.db.values()).filter(s => s.workspaceId === workspaceId);
  }
  async findNewStaffByMonth(workspaceId: string, yearMonth: YearMonth): Promise<Staff[]> {
    const start = yearMonth.getStartDate().getTime();
    const end = yearMonth.getEndDate().getTime();
    return Array.from(this.db.values()).filter(
      s => s.workspaceId === workspaceId && s.createdAt.getTime() >= start && s.createdAt.getTime() <= end
    );
  }
  async getNextStaffNo(workspaceId: string): Promise<string> {
    const nextNum = this.db.size + 1;
    return 'S' + String(nextNum).padStart(3, '0');
  }
  async save(staff: Staff): Promise<void> {
    this.db.set(staff.staffNo, staff);
  }
}

class MockHoldingRepository implements IFlyerHoldingRepository {
  public db = new Map<string, FlyerHolding>();
  async findByStaffNo(staffNo: string): Promise<FlyerHolding | undefined> {
    return this.db.get(staffNo);
  }
  async save(holding: FlyerHolding): Promise<void> {
    this.db.set(holding.staffNo, holding);
  }
}

class MockActivityRepository implements IActivityRepository {
  public db = new Map<string, DistributionActivity>();
  async findLatestByStaff(staffNo: string, limit: number): Promise<DistributionActivity[]> {
    return Array.from(this.db.values())
      .filter(a => a.staffNo === staffNo)
      .slice(0, limit);
  }
  async findByPeriod(start: Date, end: Date): Promise<DistributionActivity[]> {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return Array.from(this.db.values()).filter(
      a => a.occurredAt.getTime() >= startTime && a.occurredAt.getTime() <= endTime
    );
  }
  async findByYearMonth(workspaceId: string, yearMonth: YearMonth): Promise<DistributionActivity[]> {
    const start = yearMonth.getStartDate().getTime();
    const end = yearMonth.getEndDate().getTime();
    return Array.from(this.db.values()).filter(
      a => a.occurredAt.getTime() >= start && a.occurredAt.getTime() <= end
    );
  }
  async save(activity: DistributionActivity): Promise<void> {
    this.db.set(activity.id, activity);
  }
}

async function runTests() {
  console.log('[Test DashboardApplicationService] Verifying S5-7 crossing-month scenario...');

  const wsRepo = new MockWorkspaceRepository();
  const staffRepo = new MockStaffRepository();
  const holdingRepo = new MockHoldingRepository();
  const activityRepo = new MockActivityRepository();

  const service = new DashboardApplicationService(wsRepo, staffRepo, holdingRepo, activityRepo);

  const workspaceId = 'WS-MIE-03';
  await wsRepo.save(new Workspace({
    workspaceId,
    workspaceName: '三重第3支部',
    status: 'ACTIVE'
  }));

  // ==================== JULY 2026 ====================
  const july = new YearMonth('202607');
  
  // A and B registered in July
  const staffA = new Staff({ staffNo: 'S001', displayName: 'Aさん', lineUserId: 'line-A', workspaceId, createdAt: new Date('2026-07-10T10:00:00Z') });
  const staffB = new Staff({ staffNo: 'S002', displayName: 'Bさん', lineUserId: 'line-B', workspaceId, createdAt: new Date('2026-07-12T12:00:00Z') });
  await staffRepo.save(staffA);
  await staffRepo.save(staffB);

  // Holdings in July: A = 1200, B = 800
  await holdingRepo.save(new FlyerHolding({ staffNo: 'S001', quantity: new Quantity(1200), updatedAt: new Date('2026-07-10') }));
  await holdingRepo.save(new FlyerHolding({ staffNo: 'S002', quantity: new Quantity(800), updatedAt: new Date('2026-07-12') }));

  // Activities in July
  await activityRepo.save(new DistributionActivity({
    id: 'ACT_JULY_A',
    staffNo: 'S001',
    reportedQuantity: new Quantity(1200),
    photoUrl: 'http://example.com/a.jpg',
    location: new Location(34, 136, 0),
    occurredAt: new Date('2026-07-15T10:00:00Z')
  }));
  await activityRepo.save(new DistributionActivity({
    id: 'ACT_JULY_B',
    staffNo: 'S002',
    reportedQuantity: new Quantity(800),
    photoUrl: 'http://example.com/b.jpg',
    location: new Location(34, 136, 0),
    occurredAt: new Date('2026-07-16T12:00:00Z')
  }));

  // Verify July Dashboard
  const julyDashboard = await service.getWorkspaceDashboard(workspaceId, july);
  assert(julyDashboard.members.length === 2, 'July member count mismatch');
  assert(julyDashboard.totalHoldingQuantity === 2000, 'July total holding mismatch'); // 1200 + 800
  assert(julyDashboard.newMembers.length === 2, 'July new members count mismatch');
  assert(julyDashboard.newMembers.some(m => m.staffNo === 'S001'), 'July new members must include A');
  assert(julyDashboard.newMembers.some(m => m.staffNo === 'S002'), 'July new members must include B');

  const julyRankings = await service.getMonthlyRanking(workspaceId, july);
  assert(julyRankings.length === 2, 'July ranking length mismatch');
  assert(julyRankings[0].staffNo === 'S001' && julyRankings[0].quantity === 1200, 'July Rank 1 mismatch');
  assert(julyRankings[1].staffNo === 'S002' && julyRankings[1].quantity === 800, 'July Rank 2 mismatch');

  // ==================== AUGUST 2026 ====================
  const august = new YearMonth('202608');

  // C registered in August
  const staffC = new Staff({ staffNo: 'S003', displayName: 'Cさん', lineUserId: 'line-C', workspaceId, createdAt: new Date('2026-08-03T09:00:00Z') });
  await staffRepo.save(staffC);

  // Modify holdings: A = 1000, B = 500, C = 300
  await holdingRepo.save(new FlyerHolding({ staffNo: 'S001', quantity: new Quantity(1000), updatedAt: new Date('2026-08-01') }));
  await holdingRepo.save(new FlyerHolding({ staffNo: 'S002', quantity: new Quantity(500), updatedAt: new Date('2026-08-02') }));
  await holdingRepo.save(new FlyerHolding({ staffNo: 'S003', quantity: new Quantity(300), updatedAt: new Date('2026-08-03') }));

  // C records activity in August
  await activityRepo.save(new DistributionActivity({
    id: 'ACT_AUG_C',
    staffNo: 'S003',
    reportedQuantity: new Quantity(700),
    photoUrl: 'http://example.com/c.jpg',
    location: new Location(34, 136, 0),
    occurredAt: new Date('2026-08-05T10:00:00Z')
  }));

  // Verify August Dashboard
  const augustDashboard = await service.getWorkspaceDashboard(workspaceId, august);
  // 1. Staff roster continues to exist (A, B, C)
  assert(augustDashboard.members.length === 3, 'August member count mismatch');
  // 2. Holding persists with updated values: 1000 + 500 + 300 = 1800
  assert(augustDashboard.totalHoldingQuantity === 1800, `August total holding mismatch: expected 1800, got ${augustDashboard.totalHoldingQuantity}`);
  // 3. Only C registered in August
  assert(augustDashboard.newMembers.length === 1, 'August new members count mismatch');
  assert(augustDashboard.newMembers[0].staffNo === 'S003', 'August new member must be C');
  assert(augustDashboard.newMembers[0].registeredAt === '2026/08/03', 'C registered date mismatch');
  assert(augustDashboard.newMembers[0].holdingQuantity === 300, 'C holding mismatch');

  // 4. August ranking should only include August activities (C: 700, A: 0, B: 0)
  const augustRankings = await service.getMonthlyRanking(workspaceId, august);
  assert(augustRankings.length === 3, 'August rankings length mismatch');
  assert(augustRankings[0].staffNo === 'S003' && augustRankings[0].quantity === 700, 'August Rank 1 must be C');
  assert(augustRankings[1].quantity === 0 && augustRankings[2].quantity === 0, 'A and B must have 0 activity in August');

  console.log('[Test DashboardApplicationService] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
