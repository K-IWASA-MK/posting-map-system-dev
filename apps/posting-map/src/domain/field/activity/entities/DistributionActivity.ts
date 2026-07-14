import { Quantity } from '../../valueobjects/Quantity';
import { Location } from '../../valueobjects/Location';
import { AreaId } from '../../valueobjects/AreaId';
import { GPSEvidence } from '../../valueobjects/GPSEvidence';
import { PhotoEvidence } from '../../valueobjects/PhotoEvidence';
import { DistributionActivityCompletedEvent, GPSEvidenceRejectedEvent, PhotoEvidenceRejectedEvent } from '../../events/FieldDomainEvents';
import { FieldEvent } from '../../events/FieldEvent';

export type ActivityStatus = 'IN_PROGRESS' | 'COMPLETED';

export class DistributionActivity {
  public readonly id: string;
  public readonly staffNo: string;
  public readonly reportedQuantity: Quantity;
  public readonly gpsEvidence: GPSEvidence;
  public readonly photoEvidence: PhotoEvidence;
  public readonly occurredAt: Date;
  public readonly areaId?: AreaId;
  private status: ActivityStatus = 'IN_PROGRESS';

  constructor(params: {
    id: string;
    staffNo: string;
    reportedQuantity: Quantity;
    gpsEvidence?: GPSEvidence;
    photoEvidence?: PhotoEvidence;
    // Backward compatibility params
    location?: Location;
    photoUrl?: string;
    occurredAt?: Date;
    areaId?: AreaId;
    status?: ActivityStatus;
  }) {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("Activity ID is required");
    }
    if (!params.staffNo || params.staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    this.id = params.id;
    this.staffNo = params.staffNo;
    this.reportedQuantity = params.reportedQuantity;
    this.occurredAt = params.occurredAt || new Date();
    this.areaId = params.areaId;
    this.status = params.status || 'IN_PROGRESS';

    // Map GPS Evidence (using params.gpsEvidence or backward-compatible params.location)
    if (params.gpsEvidence) {
      this.gpsEvidence = params.gpsEvidence;
    } else if (params.location) {
      this.gpsEvidence = new GPSEvidence(params.location, this.occurredAt);
    } else {
      this.gpsEvidence = new GPSEvidence(); // Missing GPS
    }

    // Map Photo Evidence (using params.photoEvidence or backward-compatible params.photoUrl)
    if (params.photoEvidence) {
      this.photoEvidence = params.photoEvidence;
    } else if (params.photoUrl) {
      const urlToUse = params.photoUrl === 'none' ? undefined : params.photoUrl;
      this.photoEvidence = new PhotoEvidence(urlToUse, this.occurredAt);
    } else {
      this.photoEvidence = new PhotoEvidence(); // Missing photo
    }
  }

  public getStatus(): ActivityStatus {
    return this.status;
  }

  // --- Backward Compatibility Getters ---
  public get photoUrl(): string {
    return this.photoEvidence.photoUrl || 'none';
  }

  public get location(): Location {
    return this.gpsEvidence.location || new Location(0, 0, 0);
  }

  /**
   * Completes the distribution activity.
   * Enforces all business rules and returns events.
   */
  public complete(params: {
    now?: Date;
    photoRequired?: boolean;
  }): FieldEvent[] {
    const now = params.now || new Date();
    const photoRequired = params.photoRequired !== false; // Default to true unless explicitly false
    const events: FieldEvent[] = [];

    // 1. Validation for Quantity
    if (this.reportedQuantity.getValue() <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // 2. Validation for AreaId
    if (!this.areaId) {
      throw new Error("Target area is required");
    }

    // 3. Validation for GPS evidence
    try {
      this.gpsEvidence.validate(now);
    } catch (e: any) {
      events.push(new GPSEvidenceRejectedEvent(this.id, e.message));
      throw e;
    }

    // 4. Validation for Photo evidence
    try {
      this.photoEvidence.validate(photoRequired);
    } catch (e: any) {
      events.push(new PhotoEvidenceRejectedEvent(this.id, e.message));
      throw e;
    }

    // Mark as completed
    this.status = 'COMPLETED';

    // Raise completed event
    events.push(new DistributionActivityCompletedEvent(
      this.id,
      this.staffNo,
      this.reportedQuantity.getValue(),
      this.areaId.getValue()
    ));

    return events;
  }
}
