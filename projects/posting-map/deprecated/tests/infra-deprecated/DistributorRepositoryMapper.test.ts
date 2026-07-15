import { DistributorRepositoryMapper } from '@infra/repository/field/DistributorRepositoryMapper';
import { Distributor } from '@domain/field/entities/Distributor';
import { AreaId } from '@domain/field/valueobjects/AreaId';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test DistributorRepositoryMapper] Verifying DistributorRepositoryMapper...');

  const a1 = new AreaId('AREA-01');
  const a2 = new AreaId('AREA-02');

  // 1. Entity to Record
  {
    const entity = new Distributor({
      id: 'D-01',
      name: '鈴木 配布員',
      identityId: 'ID-SUZUKI',
      areaIds: [a1, a2],
      status: 'ACTIVE'
    });

    const record = DistributorRepositoryMapper.toRecord(entity);
    assert(record.id === 'D-01', 'ID mapping mismatch');
    assert(record.name === '鈴木 配布員', 'Name mapping mismatch');
    assert(record.identityId === 'ID-SUZUKI', 'Identity ID mapping mismatch');
    assert(record.areaIds.length === 2, 'Area IDs list mapping mismatch');
    assert(record.areaIds[0] === 'AREA-01', 'Area ID 0 mapping mismatch');
    assert(record.areaIds[1] === 'AREA-02', 'Area ID 1 mapping mismatch');
    assert(record.status === 'ACTIVE', 'Status mapping mismatch');
  }

  // 2. Record to Entity
  {
    const record = {
      id: 'D-02',
      name: '佐藤 配布員',
      identityId: 'ID-SATO',
      areaIds: ['AREA-03'],
      status: 'INACTIVE'
    };

    const entity = DistributorRepositoryMapper.toEntity(record);
    assert(entity.id === 'D-02', 'ID mapping mismatch');
    assert(entity.name === '佐藤 配布員', 'Name mapping mismatch');
    assert(entity.identityId === 'ID-SATO', 'Identity ID mapping mismatch');
    assert(entity.getAreaIds().length === 1, 'Area IDs mapping mismatch');
    assert(entity.getAreaIds()[0].getValue() === 'AREA-03', 'Area ID mapping mismatch');
    assert(entity.getStatus() === 'INACTIVE', 'Status mapping mismatch');
  }

  // 3. Reject invalid status
  {
    const record = {
      id: 'D-02',
      name: '佐藤 配布員',
      identityId: 'ID-SATO',
      areaIds: [],
      status: 'INVALID_STATUS'
    };

    let errorThrown = false;
    try {
      DistributorRepositoryMapper.toEntity(record);
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown, 'Mapper must reject invalid status');
  }

  console.log('[Test DistributorRepositoryMapper] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
