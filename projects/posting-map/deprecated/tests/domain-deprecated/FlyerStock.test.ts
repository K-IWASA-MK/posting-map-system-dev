import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test FlyerStock] Verifying FlyerStock entity...');

  const areaId = new AreaId('AREA-01');

  // 1. Initial status checks
  {
    const stock = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(1000),
      status: 'AVAILABLE'
    });

    assert(stock.id === 'FS-01', 'ID mismatch');
    assert(stock.ownerId === 'OWNER-01', 'OwnerID mismatch');
    assert(stock.areaId.equals(areaId), 'AreaId mismatch');
    assert(stock.getQuantity().getValue() === 1000, 'Initial quantity mismatch');
    assert(stock.getStatus() === 'AVAILABLE', 'Initial status mismatch');
  }

  // 2. Reserve operation decreases stock and updates status to RESERVED
  {
    const stock = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(1000),
      status: 'AVAILABLE'
    });

    stock.reserve(new Quantity(400));
    assert(stock.getQuantity().getValue() === 600, 'Remaining stock mismatch');
    assert(stock.getStatus() === 'RESERVED', 'Status must transition to RESERVED');
  }

  // 3. Reserving all stock updates status to DEPLETED
  {
    const stock = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(1000),
      status: 'AVAILABLE'
    });

    stock.reserve(new Quantity(1000));
    assert(stock.getQuantity().getValue() === 0, 'Remaining stock must be 0');
    assert(stock.getStatus() === 'DEPLETED', 'Status must transition to DEPLETED');
  }

  // 4. Reserve from depleted rejects
  {
    const stock = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(0),
      status: 'DEPLETED'
    });

    let errorThrown = false;
    try {
      stock.reserve(new Quantity(10));
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown, 'Cannot reserve from depleted stock');
  }

  // 5. Reserve exceeding quantity rejects
  {
    const stock = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(100),
      status: 'AVAILABLE'
    });

    let errorThrown = false;
    try {
      stock.reserve(new Quantity(101));
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown, 'Cannot reserve exceeding quantity');
  }

  // 6. Replenish restores status to AVAILABLE
  {
    const stock = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(0),
      status: 'DEPLETED'
    });

    stock.replenish(new Quantity(500));
    assert(stock.getQuantity().getValue() === 500, 'Replenished quantity mismatch');
    assert(stock.getStatus() === 'AVAILABLE', 'Status must transition to AVAILABLE after replenish');
  }

  console.log('[Test FlyerStock] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
