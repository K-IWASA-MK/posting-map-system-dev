import { DistributionActivity } from '@domain/field/activity/entities/DistributionActivity';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { Location } from '@domain/field/valueobjects/Location';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('[Test Activity] Verifying DistributionActivity entity...');

  const activity = new DistributionActivity({
    id: 'ACT-01',
    staffNo: 'S037',
    reportedQuantity: new Quantity(300),
    photoUrl: 'http://example.com/photo.png',
    location: new Location(34.965, 136.622, 5)
  });

  assert(activity.id === 'ACT-01', 'id mismatch');
  assert(activity.staffNo === 'S037', 'staffNo mismatch');
  assert(activity.reportedQuantity.getValue() === 300, 'reportedQuantity mismatch');
  assert(activity.photoUrl === 'http://example.com/photo.png', 'photoUrl mismatch');
  assert(activity.location.latitude === 34.965, 'latitude mismatch');
  assert(activity.location.longitude === 136.622, 'longitude mismatch');
  assert(activity.occurredAt instanceof Date, 'occurredAt must be Date');

  console.log('[Test Activity] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
