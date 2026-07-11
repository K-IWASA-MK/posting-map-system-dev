import { DistributionApplicationService } from '@application/field/services/DistributionApplicationService';
import { IDistributorRepository } from '@domain/field/repositories/IDistributorRepository';
import { Distributor } from '@domain/field/entities/Distributor';
import { AreaId } from '@domain/field/valueobjects/AreaId';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockDistributorRepository implements IDistributorRepository {
  public db = new Map<string, Distributor>();

  public async findById(id: string): Promise<Distributor | undefined> {
    return this.db.get(id);
  }

  public async save(distributor: Distributor): Promise<void> {
    this.db.set(distributor.id, distributor);
  }
}

async function runTests() {
  console.log('[Test DistributionApplicationService] Verifying service...');

  const repo = new MockDistributorRepository();
  const service = new DistributionApplicationService(repo);

  const initialDist = new Distributor({
    id: 'DIST-1',
    name: '鈴木 配布員',
    identityId: 'ID-SUZUKI',
    areaIds: [],
    status: 'INACTIVE'
  });
  await repo.save(initialDist);

  // 1. Get Distributor
  {
    const dto = await service.getDistributor('DIST-1');
    assert(dto !== undefined, 'Distributor should be found');
    assert(dto?.name === '鈴木 配布員', 'Name mismatch');
    assert(dto?.status === 'INACTIVE', 'Status mismatch');
  }

  // 2. Activate Distributor
  {
    const dto = await service.activateDistributor('DIST-1');
    assert(dto.status === 'ACTIVE', 'Status must become ACTIVE');
  }

  // 3. Assign Area
  {
    const dto = await service.assignArea('DIST-1', 'AREA-51');
    assert(dto.areaIds.length === 1, 'Area count must be 1');
    assert(dto.areaIds[0] === 'AREA-51', 'Area ID mismatch');
  }

  console.log('[Test DistributionApplicationService] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
