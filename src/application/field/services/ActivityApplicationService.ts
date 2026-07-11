import { IActivityRepository } from '@domain/field/activity/repositories/IActivityRepository';
import { DistributionActivity } from '@domain/field/activity/entities/DistributionActivity';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { Location } from '@domain/field/valueobjects/Location';
import { RecordActivityCommand } from '../commands/RecordActivityCommand';
import { ActivityDto } from '../dto/ActivityDto';
import { ApplicationEventPublisher } from '../../events/ApplicationEventPublisher';
import { DistributionActivityRecordedEvent } from '@domain/field/events/FieldEvent';

export class ActivityApplicationService {
  constructor(
    private activityRepository: IActivityRepository,
    private eventPublisher: ApplicationEventPublisher
  ) {}

  public async getLatestActivities(staffNo: string, limit: number = 10): Promise<ActivityDto[]> {
    const list = await this.activityRepository.findLatestByStaff(staffNo, limit);
    return list.map(a => this.toDto(a));
  }

  public async recordActivity(command: RecordActivityCommand): Promise<ActivityDto> {
    const activityId = `ACT-${command.staffNo}-${Date.now()}`;
    const activity = new DistributionActivity({
      id: activityId,
      staffNo: command.staffNo,
      reportedQuantity: new Quantity(command.quantity),
      photoUrl: command.photoUrl,
      location: new Location(command.latitude, command.longitude, command.accuracy)
    });

    await this.activityRepository.save(activity);

    const event = new DistributionActivityRecordedEvent(
      activityId,
      command.staffNo,
      command.quantity,
      command.photoUrl,
      command.latitude,
      command.longitude
    );
    this.eventPublisher.publish(event);

    return this.toDto(activity);
  }

  private toDto(activity: DistributionActivity): ActivityDto {
    return {
      id: activity.id,
      staffNo: activity.staffNo,
      reportedQuantity: activity.reportedQuantity.getValue(),
      photoUrl: activity.photoUrl,
      latitude: activity.location.latitude,
      longitude: activity.location.longitude,
      accuracy: activity.location.accuracy,
      occurredAt: activity.occurredAt.toISOString()
    };
  }
}
