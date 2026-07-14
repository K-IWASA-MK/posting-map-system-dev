import { FlyerHolding } from '@domain/field/holding/entities/FlyerHolding';
import { Quantity } from '@domain/field/valueobjects/Quantity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test FlyerHolding] Verifying FlyerHolding entity...');

  const holding = new FlyerHolding({
    staffNo: 'S037',
    quantity: new Quantity(1000)
  });

  assert(holding.staffNo === 'S037', 'staffNo mismatch');
  assert(holding.getQuantity().getValue() === 1000, 'quantity mismatch');
  assert(holding.getUpdatedAt() instanceof Date, 'updatedAt must be Date');

  // Verify direct update (self-declaration)
  holding.updateQuantity(new Quantity(2000));
  assert(holding.getQuantity().getValue() === 2000, 'updated quantity mismatch');

  // Verify absence of auto-calculation methods
  const prototype = FlyerHolding.prototype as any;
  assert(prototype.subtract === undefined, 'subtract method must not exist');
  assert(prototype.add === undefined, 'add method must not exist');
  assert(prototype.reserve === undefined, 'reserve method must not exist');

  console.log('[Test FlyerHolding] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
