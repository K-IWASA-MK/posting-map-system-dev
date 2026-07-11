import { FlyerRepositoryMapper } from '@infra/repository/field/FlyerRepositoryMapper';
import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test FlyerRepositoryMapper] Verifying FlyerRepositoryMapper...');

  const areaId = new AreaId('AREA-01');

  // 1. Entity to Record
  {
    const entity = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(100),
      status: 'AVAILABLE',
      createdAt: new Date(1710000000000),
      updatedAt: new Date(1710000001000)
    });

    const record = FlyerRepositoryMapper.toRecord(entity);
    assert(record.id === 'FS-01', 'ID mapping mismatch');
    assert(record.ownerId === 'OWNER-01', 'Owner ID mapping mismatch');
    assert(record.areaId === 'AREA-01', 'Area ID mapping mismatch');
    assert(record.quantity === 100, 'Quantity mapping mismatch');
    assert(record.status === 'AVAILABLE', 'Status mapping mismatch');
    assert(record.createdAt === 1710000000000, 'createdAt mapping mismatch');
    assert(record.updatedAt === 1710000001000, 'updatedAt mapping mismatch');
  }

  // 2. Record to Entity
  {
    const record = {
      id: 'FS-02',
      ownerId: 'OWNER-02',
      areaId: 'AREA-02',
      quantity: 200,
      status: 'RESERVED',
      createdAt: 1710000002000,
      updatedAt: 1710000003000
    };

    const entity = FlyerRepositoryMapper.toEntity(record);
    assert(entity.id === 'FS-02', 'ID mapping mismatch');
    assert(entity.ownerId === 'OWNER-02', 'Owner ID mapping mismatch');
    assert(entity.areaId.getValue() === 'AREA-02', 'Area ID mapping mismatch');
    assert(entity.getQuantity().getValue() === 200, 'Quantity mapping mismatch');
    assert(entity.getStatus() === 'RESERVED', 'Status mapping mismatch');
    assert(entity.createdAt.getTime() === 1710000002000, 'createdAt mapping mismatch');
    assert(entity.getUpdatedAt().getTime() === 1710000003000, 'updatedAt mapping mismatch');
  }

  // 3. Reject negative quantity
  {
    const record = {
      id: 'FS-02',
      ownerId: 'OWNER-02',
      areaId: 'AREA-02',
      quantity: -50,
      status: 'AVAILABLE',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    let errorThrown = false;
    try {
      FlyerRepositoryMapper.toEntity(record);
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown, 'Mapper must reject negative quantity');
  }

  // 4. Reject invalid status
  {
    const record = {
      id: 'FS-02',
      ownerId: 'OWNER-02',
      areaId: 'AREA-02',
      quantity: 100,
      status: 'INVALID_STATUS',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    let errorThrown = false;
    try {
      FlyerRepositoryMapper.toEntity(record);
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown, 'Mapper must reject invalid status');
  }

  console.log('[Test FlyerRepositoryMapper] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
