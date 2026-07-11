import { DistributionDomainService } from '@domain/field/services/DistributionDomainService';
import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test DistributionDomainService] Verifying DistributionDomainService domain service...');

  const areaId = new AreaId('AREA-01');
  const service = new DistributionDomainService();

  // 1. Success reservation flow
  {
    const stock = new FlyerStock({
      id: 'FS-01',
      ownerId: 'OWNER-01',
      areaId,
      quantity: new Quantity(1000),
      status: 'AVAILABLE'
    });

    const event = service.reserveFromStock(stock, new Quantity(300));
    assert(event.flyerStockId === 'FS-01', 'Event stock ID mismatch');
    assert(event.ownerId === 'OWNER-01', 'Event owner ID mismatch');
    assert(event.reservedAmount === 300, 'Event reserved amount mismatch');
    assert(event.remainingAmount === 700, 'Event remaining amount mismatch');
    assert(stock.getQuantity().getValue() === 700, 'Stock entity quantity must be updated');
  }

  // 2. Reject reservation if stock is depleted
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
      service.reserveFromStock(stock, new Quantity(10));
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown, 'Depleted stock must reject reservation');
  }

  // 3. Reject reservation if stock is insufficient
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
      service.reserveFromStock(stock, new Quantity(101));
    } catch (e) {
      errorThrown = true;
    }
    assert(errorThrown, 'Insufficient stock must reject reservation');
  }

  console.log('[Test DistributionDomainService] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
