import { WorkspaceOnboardingService } from '@application/onboarding/services/WorkspaceOnboardingService';
import { WorkspaceIdGenerator } from '@application/onboarding/services/WorkspaceIdGenerator';
import { IWorkspaceRepository } from '@domain/workspace/repositories/IWorkspaceRepository';
import { IWorkspaceSubscriptionRepository } from '@domain/workspace/repositories/IWorkspaceSubscriptionRepository';
import { Workspace } from '@domain/workspace/entities/Workspace';
import { WorkspaceSubscription } from '@domain/workspace/entities/WorkspaceSubscription';
import { WorkspaceUrl } from '@domain/workspace/valueobjects/WorkspaceUrl';

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

  async save(workspace: Workspace): Promise<void> {
    this.db.set(workspace.workspaceId, workspace);
  }
}

class MockWorkspaceSubscriptionRepository implements IWorkspaceSubscriptionRepository {
  public db = new Map<string, WorkspaceSubscription>();

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceSubscription | undefined> {
    return this.db.get(workspaceId);
  }

  async findAll(): Promise<WorkspaceSubscription[]> {
    return Array.from(this.db.values());
  }

  async save(subscription: WorkspaceSubscription): Promise<void> {
    this.db.set(subscription.workspaceId, subscription);
  }

  async create(subscription: WorkspaceSubscription): Promise<void> {
    this.db.set(subscription.workspaceId, subscription);
  }
}

async function runTests() {
  console.log('[Test WorkspaceOnboardingService] Starting unit tests...');

  // 1. Test WorkspaceIdGenerator
  console.log('  Testing WorkspaceIdGenerator...');
  assert(WorkspaceIdGenerator.generate('三重県 第4支部') === 'mie-04', 'Should parse Mie 04');
  assert(WorkspaceIdGenerator.generate('東京都 第二支部') === 'tokyo-02', 'Should parse Tokyo 02 (kanji)');
  assert(WorkspaceIdGenerator.generate('大阪府 第１支部') === 'osaka-01', 'Should parse Osaka 01 (full-width)');
  assert(WorkspaceIdGenerator.generate('愛知県 第14支部') === 'aichi-14', 'Should parse Aichi 14 (no padding needed)');
  
  const fallbackId = WorkspaceIdGenerator.generate('不明な支部');
  assert(fallbackId.startsWith('workspace-'), 'Fallback ID should start with workspace-');
  assert(fallbackId.split('-').length === 3, 'Fallback ID should have 3 segments');

  // Initialize service
  const wsRepo = new MockWorkspaceRepository();
  const subRepo = new MockWorkspaceSubscriptionRepository();
  const service = new WorkspaceOnboardingService(wsRepo, subRepo);

  // 2. Test WorkspaceOnboardingService.createWorkspace
  console.log('  Testing createWorkspace...');
  const dto = await service.createWorkspace('三重県 第3支部');
  assert(dto.workspaceId === 'mie-03', 'Generated ID should be mie-03');
  assert(dto.workspaceName === '三重県 第3支部', 'Name should match');
  assert(dto.status === 'ACTIVE', 'Subscription should be ACTIVE');
  assert(dto.lineAppUrl === 'https://liff.line.me/2010177345-tXZIMAJK/mie-03', 'Line URL mismatch');
  assert(dto.dashboardUrl === 'https://posting-map.jp/dashboard/mie-03', 'Dashboard URL mismatch');

  // Verify stored entities
  const storedWs = await wsRepo.findById('mie-03');
  assert(storedWs !== undefined, 'Workspace should be stored');
  assert(storedWs!.workspaceName === '三重県 第3支部', 'Stored name should match');
  
  const storedSub = await subRepo.findByWorkspaceId('mie-03');
  assert(storedSub !== undefined, 'Subscription should be stored');
  assert(storedSub!.getStatus() === 'ACTIVE', 'Stored status should be ACTIVE');
  
  // Verify default 1 month subscription period
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const expiryDiff = Math.abs(storedSub!.getExpiresAt().getTime() - oneMonthLater.getTime());
  assert(expiryDiff < 5000, 'Subscription expiry should default to 1 month');

  // 3. Test ID Duplication suffix incrementation
  console.log('  Testing duplicate ID suffix logic...');
  const duplicateDto = await service.createWorkspace('三重県 第3支部');
  assert(duplicateDto.workspaceId === 'mie-03-2', 'Should append suffix for duplicate: mie-03-2');
  
  const triplicateDto = await service.createWorkspace('三重県 第3支部');
  assert(triplicateDto.workspaceId === 'mie-03-3', 'Should append suffix for triplicate: mie-03-3');

  // 4. Test activate and suspend Workspace
  console.log('  Testing activation and suspension...');
  await service.suspendWorkspace('mie-03');
  const suspendedSub = await subRepo.findByWorkspaceId('mie-03');
  assert(suspendedSub!.getStatus() === 'SUSPENDED', 'Status should be updated to SUSPENDED');

  await service.activateWorkspace('mie-03');
  const activeSub = await subRepo.findByWorkspaceId('mie-03');
  assert(activeSub!.getStatus() === 'ACTIVE', 'Status should be updated to ACTIVE');

  // 5. Test getWorkspaceProvisioningStatus
  console.log('  Testing getWorkspaceProvisioningStatus...');
  const statusDto = await service.getWorkspaceProvisioningStatus('mie-03');
  assert(statusDto.workspaceId === 'mie-03', 'ID mismatch');
  assert(statusDto.subscriptionStatus === 'ACTIVE', 'Status mismatch');

  console.log('[Test WorkspaceOnboardingService] All unit tests PASSED.');
}

runTests().catch(e => {
  console.error('[Test WorkspaceOnboardingService] Test suite failed!');
  console.error(e);
  process.exit(1);
});
