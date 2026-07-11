import { Distributor } from '@domain/field/entities/Distributor';
import { AreaId } from '@domain/field/valueobjects/AreaId';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Distributor] Verifying Distributor entity...');

  const a1 = new AreaId('AREA-01');
  const a2 = new AreaId('AREA-02');

  // 1. Initial creation
  {
    const d = new Distributor({
      id: 'D-01',
      name: '鈴木 配布員',
      identityId: 'ID-SUZUKI',
      areaIds: [a1],
      status: 'INACTIVE'
    });

    assert(d.id === 'D-01', 'ID mismatch');
    assert(d.name === '鈴木 配布員', 'Name mismatch');
    assert(d.identityId === 'ID-SUZUKI', 'Identity ID mismatch');
    assert(d.getAreaIds().length === 1, 'Initial area list count mismatch');
    assert(d.getAreaIds()[0].equals(a1), 'Initial area ID mismatch');
    assert(d.getStatus() === 'INACTIVE', 'Initial status mismatch');
  }

  // 2. Activate & Deactivate
  {
    const d = new Distributor({
      id: 'D-01',
      name: '鈴木 配布員',
      identityId: 'ID-SUZUKI',
      areaIds: [],
      status: 'INACTIVE'
    });

    d.activate();
    assert(d.getStatus() === 'ACTIVE', 'Activate status must be ACTIVE');

    d.deactivate();
    assert(d.getStatus() === 'INACTIVE', 'Deactivate status must be INACTIVE');
  }

  // 3. Assign & Unassign Area
  {
    const d = new Distributor({
      id: 'D-01',
      name: '鈴木 配布員',
      identityId: 'ID-SUZUKI',
      areaIds: [a1],
      status: 'ACTIVE'
    });

    // Assign new area
    d.assignArea(a2);
    assert(d.getAreaIds().length === 2, 'Assigned area list count mismatch');
    assert(d.getAreaIds().some(id => id.equals(a2)), 'Assigned area list must contain AREA-02');

    // Assign duplicate area (should ignore)
    d.assignArea(a2);
    assert(d.getAreaIds().length === 2, 'Duplicate assignment should be ignored');

    // Unassign area
    d.unassignArea(a1);
    assert(d.getAreaIds().length === 1, 'Unassigned area list count mismatch');
    assert(!d.getAreaIds().some(id => id.equals(a1)), 'Unassigned area list must not contain AREA-01');
  }

  console.log('[Test Distributor] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
