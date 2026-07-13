import { Quantity } from '../../valueobjects/Quantity';
import { Location } from '../../valueobjects/Location';

export class DistributionActivity {
  public readonly id: string;
  public readonly staffNo: string;
  public readonly reportedQuantity: Quantity;
  public readonly photoUrl: string;
  public readonly location: Location;
  public readonly occurredAt: Date;

  constructor(params: {
    id: string;
    staffNo: string;
    reportedQuantity: Quantity;
    photoUrl: string;
    location: Location;
    occurredAt?: Date;
  }) {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("Activity ID is required");
    }
    if (!params.staffNo || params.staffNo.trim().length === 0) {
      throw new Error("staffNo is required");
    }
    if (!params.photoUrl || params.photoUrl.trim().length === 0) {
      throw new Error("photoUrl is required");
    }
    this.id = params.id;
    this.staffNo = params.staffNo;
    this.reportedQuantity = params.reportedQuantity;
    this.photoUrl = params.photoUrl;
    this.location = params.location;
    this.occurredAt = params.occurredAt || new Date();
  }
}
