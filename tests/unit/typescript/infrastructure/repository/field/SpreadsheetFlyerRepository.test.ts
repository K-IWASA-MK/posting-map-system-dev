import { MockSpreadsheetClient } from '../../mock/MockSpreadsheetClient';
import { SpreadsheetFlyerRepository } from '@infra/repository/field/SpreadsheetFlyerRepository';
import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test SpreadsheetFlyerRepository] Verifying SpreadsheetFlyerRepository...');

  const mockClient = MockSpreadsheetClient.createAndInject();
  const mockSs = mockClient.getSpreadsheet();

  const headers = ['ID', 'Owner ID', 'Area ID', 'Quantity', 'Status', 'Created At', 'Updated At'];
  const initialRows = [
    headers,
    ['FS-01', 'OWNER-01', 'AREA-01', '1000', 'AVAILABLE', '1710000000000', '1710000000000'],
    ['FS-02', 'OWNER-01', 'AREA-02', '500', 'RESERVED', '1710000000000', '1710000000000'],
    ['FS-03', 'OWNER-02', 'AREA-01', '0', 'DEPLETED', '1710000000000', '1710000000000']
  ];

  mockSs.addSheet('Flyers', initialRows);

  const repo = new SpreadsheetFlyerRepository();

  // 1. findById
  {
    const flyer = await repo.findById('FS-01');
    assert(flyer !== undefined, 'Flyer FS-01 must be found');
    assert(flyer?.ownerId === 'OWNER-01', 'Owner ID mismatch');
    assert(flyer?.getQuantity().getValue() === 1000, 'Quantity mismatch');
  }

  // 2. findByOwner
  {
    const list = await repo.findByOwner('OWNER-01');
    assert(list.length === 2, 'OWNER-01 must have 2 flyers');
    assert(list.some(f => f.id === 'FS-01'), 'Must contain FS-01');
    assert(list.some(f => f.id === 'FS-02'), 'Must contain FS-02');
  }

  // 3. findAvailable
  {
    const list = await repo.findAvailable(new AreaId('AREA-01'));
    // FS-03 is depleted, so only FS-01 is available
    assert(list.length === 1, 'Only 1 available stock in AREA-01');
    assert(list[0].id === 'FS-01', 'Available stock must be FS-01');
  }

  // 4. exists
  {
    assert(await repo.exists('FS-01') === true, 'FS-01 must exist');
    assert(await repo.exists('FS-NONEXISTENT') === false, 'FS-NONEXISTENT must not exist');
  }

  // 5. save (update existing)
  {
    const flyer = await repo.findById('FS-01');
    assert(flyer !== undefined, 'FS-01 exists');
    flyer!.reserve(new Quantity(200));

    await repo.save(flyer!);

    const updated = await repo.findById('FS-01');
    assert(updated?.getQuantity().getValue() === 800, 'Quantity must be updated to 800');
    assert(updated?.getStatus() === 'RESERVED', 'Status must be updated to RESERVED');
  }

  // 6. save (insert new)
  {
    const newFlyer = new FlyerStock({
      id: 'FS-04',
      ownerId: 'OWNER-03',
      areaId: new AreaId('AREA-03'),
      quantity: new Quantity(300),
      status: 'AVAILABLE'
    });

    await repo.save(newFlyer);

    const inserted = await repo.findById('FS-04');
    assert(inserted !== undefined, 'Inserted FS-04 must be found');
    assert(inserted?.ownerId === 'OWNER-03', 'Owner ID mismatch');
    assert(inserted?.getQuantity().getValue() === 300, 'Quantity mismatch');
  }

  console.log('[Test SpreadsheetFlyerRepository] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
