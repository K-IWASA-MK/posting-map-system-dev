import { ActivityApplicationService } from '@application/field/services/ActivityApplicationService';
import { IActivityRepository } from '@domain/field/activity/repositories/IActivityRepository';
import { DistributionActivity } from '@domain/field/activity/entities/DistributionActivity';
import { RecordActivityCommand } from '@application/field/commands/RecordActivityCommand';
import { ApplicationEventPublisher } from '@application/events/ApplicationEventPublisher';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockActivityRepository implements IActivityRepository {
  public db = new Map<string, DistributionActivity>();

  public async findLatestByStaff(staffNo: string, limit: number): Promise<DistributionActivity[]> {
    return Array.from(this.db.values())
      .filter(a => a.staffNo === staffNo)
      .slice(0, limit);
  }

  public async save(activity: DistributionActivity): Promise<void> {
    this.db.set(activity.id, activity);
  }
}

async function runTests() {
  console.log('[Test ActivityApplicationService] Verifying service...');

  const repo = new MockActivityRepository();
  const publisher = new ApplicationEventPublisher();
  const service = new ActivityApplicationService(repo, publisher);

  // Record activity test
  {
    const command = new RecordActivityCommand(
      'S037',
      300,
      'http://example.com/photo.jpg',
      34.965,
      136.622,
      5
    );

    const dto = await service.recordActivity(command);
    assert(dto.staffNo === 'S037', 'staffNo mismatch');
    assert(dto.reportedQuantity === 300, 'quantity mismatch');
    assert(dto.photoUrl === 'http://example.com/photo.jpg', 'photoUrl mismatch');
    assert(dto.latitude === 34.965, 'latitude mismatch');
    assert(dto.longitude === 136.622, 'longitude mismatch');
    assert(publisher.publishedEvents.length === 1, 'Event must be published');
    assert(publisher.publishedEvents[0].eventType === 'DistributionActivityRecordedEvent', 'Event type mismatch');
  }

  console.log('[Test ActivityApplicationService] All tests PASSED.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
