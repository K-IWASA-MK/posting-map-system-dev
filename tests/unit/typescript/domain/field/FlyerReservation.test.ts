import { DistributionDomainService } from '@domain/field/services/DistributionDomainService';
import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { FlyerReservedEvent } from '@domain/field/events/FieldEvent';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test FlyerReservation] Starting FlyerReservation integration-style domain tests...');

  const service = new DistributionDomainService();
  const areaId = new AreaId('AREA-99');

  // Scenario 1: Step-by-step reservation
  {
    const stock = new FlyerStock({
      id: 'STOCK-99',
      ownerId: 'OWNER-99',
      areaId,
      quantity: new Quantity(500),
      status: 'AVAILABLE'
    });

    // 1st Reservation: 200 sheets
    const e1 = service.reserveFromStock(stock, new Quantity(200));
    assert(e1 instanceof FlyerReservedEvent, 'Event 1 must be FlyerReservedEvent');
    assert(e1.aggregateId === 'STOCK-99', 'Event 1 aggregateId mismatch');
    assert(e1.reservedAmount === 200, 'Event 1 reserved amount mismatch');
    assert(e1.remainingAmount === 300, 'Event 1 remaining amount mismatch');
    assert(stock.getQuantity().getValue() === 300, 'Stock quantity mismatch after e1');
    assert(stock.getStatus() === 'RESERVED', 'Stock status must be RESERVED after e1');

    // 2nd Reservation: 300 sheets (depleting stock)
    const e2 = service.reserveFromStock(stock, new Quantity(300));
    assert(e2 instanceof FlyerReservedEvent, 'Event 2 must be FlyerReservedEvent');
    assert(e2.reservedAmount === 300, 'Event 2 reserved amount mismatch');
    assert(e2.remainingAmount === 0, 'Event 2 remaining amount mismatch');
    assert(stock.getQuantity().getValue() === 0, 'Stock quantity mismatch after e2');
    assert(stock.getStatus() === 'DEPLETED', 'Stock status must be DEPLETED after e2');
  }

  console.log('[Test FlyerReservation] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
