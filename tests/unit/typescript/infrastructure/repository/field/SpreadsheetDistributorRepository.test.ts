import { MockSpreadsheetClient } from '../../mock/MockSpreadsheetClient';
import { SpreadsheetDistributorRepository } from '@infra/repository/field/SpreadsheetDistributorRepository';
import { Distributor } from '@domain/field/entities/Distributor';
import { AreaId } from '@domain/field/valueobjects/AreaId';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test SpreadsheetDistributorRepository] Verifying SpreadsheetDistributorRepository...');

  const mockClient = MockSpreadsheetClient.createAndInject();
  const mockSs = mockClient.getSpreadsheet();

  const headers = ['ID', 'Name', 'Identity ID', 'Area IDs', 'Status'];
  const initialRows = [
    headers,
    ['D-01', '鈴木 配布員', 'ID-SUZUKI', 'AREA-01,AREA-02', 'ACTIVE'],
    ['D-02', '佐藤 配布員', 'ID-SATO', 'AREA-03', 'INACTIVE']
  ];

  mockSs.addSheet('Distributors', initialRows);

  const repo = new SpreadsheetDistributorRepository();

  // 1. findById
  {
    const d = await repo.findById('D-01');
    assert(d !== undefined, 'Distributor D-01 must be found');
    assert(d?.name === '鈴木 配布員', 'Name mismatch');
    assert(d?.identityId === 'ID-SUZUKI', 'Identity ID mismatch');
    assert(d?.getStatus() === 'ACTIVE', 'Status mismatch');
    assert(d?.getAreaIds().length === 2, 'Area IDs list count mismatch');
    assert(d?.getAreaIds()[0].getValue() === 'AREA-01', 'Area ID 0 mismatch');
    assert(d?.getAreaIds()[1].getValue() === 'AREA-02', 'Area ID 1 mismatch');
  }

  // 2. findByArea
  {
    const list = await repo.findByArea(new AreaId('AREA-01'));
    assert(list.length === 1, 'AREA-01 must have 1 distributor');
    assert(list[0].id === 'D-01', 'Distributor must be D-01');

    const listEmpty = await repo.findByArea(new AreaId('AREA-NONE'));
    assert(listEmpty.length === 0, 'AREA-NONE must have 0 distributors');
  }

  // 3. save (update existing)
  {
    const d = await repo.findById('D-01');
    assert(d !== undefined, 'D-01 exists');
    d!.deactivate();
    d!.assignArea(new AreaId('AREA-04'));

    await repo.save(d!);

    const updated = await repo.findById('D-01');
    assert(updated !== undefined, 'D-01 must be found after update');
    assert(updated?.getStatus() === 'INACTIVE', 'Status must be updated to INACTIVE');
    assert(updated?.getAreaIds().length === 3, 'Area count must be 3');
    assert(updated?.getAreaIds().some(id => id.getValue() === 'AREA-04') === true, 'Must contain AREA-04');
  }

  // 4. save (insert new)
  {
    const newDist = new Distributor({
      id: 'D-03',
      name: '田中 配布員',
      identityId: 'ID-TANAKA',
      areaIds: [new AreaId('AREA-05')],
      status: 'ACTIVE'
    });

    await repo.save(newDist);

    const inserted = await repo.findById('D-03');
    assert(inserted !== undefined, 'Inserted D-03 must be found');
    assert(inserted?.name === '田中 配布員', 'Name mismatch');
    assert(inserted?.getStatus() === 'ACTIVE', 'Status mismatch');
    assert(inserted?.getAreaIds()[0].getValue() === 'AREA-05', 'Area ID mismatch');
  }

  console.log('[Test SpreadsheetDistributorRepository] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
