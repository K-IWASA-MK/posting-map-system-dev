import { IActivityRepository } from '@domain/field/activity/repositories/IActivityRepository';
import { DistributionActivity } from '@domain/field/activity/entities/DistributionActivity';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { Location } from '@domain/field/valueobjects/Location';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { GPSEvidence } from '@domain/field/valueobjects/GPSEvidence';
import { PhotoEvidence } from '@domain/field/valueobjects/PhotoEvidence';
import { IFlyerHoldingRepository } from '@domain/field/holding/repositories/IFlyerHoldingRepository';
import { RecordActivityCommand } from '../commands/RecordActivityCommand';
import { RecordFieldActivityCommand } from '../commands/RecordFieldActivityCommand';
import { ActivityDto } from '../dto/ActivityDto';
import { ApplicationEventPublisher } from '../../events/ApplicationEventPublisher';
import { DistributionActivityRecordedEvent } from '@domain/field/events/FieldEvent';
import { SpreadsheetClient } from '../../../infrastructure/spreadsheet/SpreadsheetClient';

declare const DriveApp: any;
declare const Utilities: any;
declare const SpreadsheetApp: any;

export class ActivityApplicationService {
  constructor(
    private activityRepository: IActivityRepository,
    private eventPublisher: ApplicationEventPublisher,
    private holdingRepository?: IFlyerHoldingRepository
  ) {}

  public async getLatestActivities(staffNo: string, limit: number = 10): Promise<ActivityDto[]> {
    const list = await this.activityRepository.findLatestByStaff(staffNo, limit);
    return list.map(a => this.toDto(a));
  }

  public async recordActivity(command: RecordActivityCommand): Promise<ActivityDto> {
    const activityId = `ACT-${command.staffNo}-${Date.now()}`;
    const gps = new GPSEvidence(
      new Location(command.latitude, command.longitude, command.accuracy),
      new Date()
    );
    const photo = new PhotoEvidence(command.photoUrl, new Date());
    
    const activity = new DistributionActivity({
      id: activityId,
      staffNo: command.staffNo,
      reportedQuantity: new Quantity(command.quantity),
      gpsEvidence: gps,
      photoEvidence: photo,
      areaId: new AreaId(command.areaId)
    });

    // Execute complete on the domain model (raises events and validates rules)
    const domainEvents = activity.complete({ now: new Date(), photoRequired: true });

    await this.activityRepository.save(activity);

    // [POSTING MAP 憲法] 自動計算・自動減算の廃止に伴い、配布実績発生時の自動在庫減算（consume）は行わない。
    // (将来の保管・棚卸し画面等のために、引数 holdingRepository 自体は維持します)

    // Publish all accumulated domain events
    for (const event of domainEvents) {
      this.eventPublisher.publish(event);
    }

    // Publish the legacy recorded event to keep backward compatibility with monitors/dashboard
    const legacyEvent = new DistributionActivityRecordedEvent(
      activityId,
      command.staffNo,
      command.quantity,
      command.photoUrl,
      command.latitude,
      command.longitude
    );
    this.eventPublisher.publish(legacyEvent);

    return this.toDto(activity);
  }

  public async recordFieldActivity(command: RecordFieldActivityCommand): Promise<ActivityDto> {
    const isComplete = command.isDone;
    const actType = command.action === 'updateRecordWithGPSPhoto'
      ? (isComplete ? 'photo' : 'revert_photo')
      : (isComplete ? 'distribute' : 'revert_distribute');
    const actCount = isComplete ? command.count : -command.count;
    
    let photoUrl = '';

    // 1. Google Drive Photo Save
    if (isComplete && command.photoData && command.photoData.startsWith('data:image')) {
      try {
        const folderId = (globalThis as any).getStorageFolderId ? (globalThis as any).getStorageFolderId() : '';
        if (folderId) {
          const folder = DriveApp.getFolderById(folderId);
          const now = new Date();
          const timeStr = Utilities.formatDate(now, 'JST', 'HHmm');
          const safeStaffName = command.staffName.replace(/[\s　]/g, '');
          const fileName = `[${command.areaName}]_${safeStaffName}_${timeStr}.jpg`;
          const base64Data = command.photoData.split(',')[1];
          const decoded = Utilities.base64Decode(base64Data);
          const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
          const file = folder.createFile(blob);
          photoUrl = file.getId();
        }
      } catch (driveErr) {
        console.error('[ActivityApplicationService] Google Drive Save Error:', driveErr);
      }
    }

    const eventId = typeof Utilities !== 'undefined' && Utilities.getUuid ? Utilities.getUuid() : `EV-${Date.now()}`;
    const timestamp = Date.now();
    const tenantId = command.tenantId || ((globalThis as any).CONFIG ? (globalThis as any).CONFIG.get('DEFAULT_TENANT_ID') : 'DEFAULT_TENANT');
    const branchId = command.branchId || ((globalThis as any).CONFIG ? (globalThis as any).CONFIG.get('DEFAULT_BRANCH_ID', tenantId) : 'DEFAULT_BRANCH');
    const prefectureId = 'MIE';

    const event = {
      id: eventId,
      timestamp,
      tenantId,
      branchId,
      prefectureId,
      blockId: command.areaName,
      userId: command.staffId,
      actionType: actType,
      count: actCount,
      lat: command.latitude || 0,
      lng: command.longitude || 0,
      meta: {
        photoUrl: photoUrl || '',
        legacyRow: command.rowId,
        staffName: command.staffName,
        legacySheetName: command.areaName
      }
    };

    // 2. Update Area Sheet
    if (typeof SpreadsheetApp !== 'undefined') {
      try {
        const ss = SpreadsheetClient.getInstance().getSpreadsheet();
        const legacySheetName = command.areaName;
        const legacySheet = ss.getSheetByName(legacySheetName);
        if (legacySheet) {
          const completedAt = Utilities.formatDate(new Date(timestamp), 'JST', 'MM/dd HH:mm');
          legacySheet.getRange(command.rowId, 4, 1, 5).setValues([[
            isComplete,
            isComplete ? completedAt : '',
            isComplete ? command.count : '',
            isComplete ? command.staffName : '',
            isComplete ? command.staffId : ''
          ]]);

          if (isComplete) {
            const gpsStr = (event.lat && event.lng) ? `${event.lat},${event.lng}` : '';
            legacySheet.getRange(command.rowId, 9).setValue(gpsStr);
            if (photoUrl) {
              legacySheet.getRange(command.rowId, 10).setValue(photoUrl);
            }
          } else {
            legacySheet.getRange(command.rowId, 9, 1, 2).setValues([['', '']]);
          }
        }
      } catch (sheetErr) {
        console.error('[ActivityApplicationService] Sheet Update Error:', sheetErr);
      }
    }

    // 3. Append Event Log
    if ((globalThis as any).appendEventLog) {
      try {
        (globalThis as any).appendEventLog(event);
      } catch (logErr) {
        console.error('[ActivityApplicationService] appendEventLog Error:', logErr);
      }
    }

    // 4. Save to Activity sheet via TS ActivityRepository
    // Only record positive completed activities in the Activity sheet
    const activityId = `ACT-${command.staffId}-${timestamp}`;
    const normalizedPhotoUrl = photoUrl || 'none';
    const activity = new DistributionActivity({
      id: activityId,
      staffNo: command.staffId,
      reportedQuantity: new Quantity(isComplete ? command.count : 0),
      photoUrl: normalizedPhotoUrl,
      location: new Location(command.latitude || 0, command.longitude || 0, command.accuracy || 0)
    });

    if (isComplete) {
      await this.activityRepository.save(activity);

      const eventObj = new DistributionActivityRecordedEvent(
        activityId,
        command.staffId,
        command.count,
        normalizedPhotoUrl,
        command.latitude,
        command.longitude
      );
      this.eventPublisher.publish(eventObj);
    }

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
