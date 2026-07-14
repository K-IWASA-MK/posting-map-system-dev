import { Location } from './Location';

export class GPSEvidence {
  public readonly location?: Location;
  public readonly measuredAt?: Date;

  constructor(location?: Location, measuredAt?: Date) {
    this.location = location;
    this.measuredAt = measuredAt;
  }

  public validate(now: Date = new Date()): void {
    if (!this.location) {
      throw new Error("MissingGPSEvidence");
    }
    if (!this.measuredAt) {
      throw new Error("MissingGPSEvidence");
    }
    const diffMs = now.getTime() - this.measuredAt.getTime();
    const diffMins = diffMs / 1000 / 60;
    // Allow a small clock skew (up to 5 minutes in either direction)
    if (diffMins > 5 || diffMins < -5) {
      throw new Error("StaleGPSEvidence");
    }
  }

  public isValid(now: Date = new Date()): boolean {
    try {
      this.validate(now);
      return true;
    } catch {
      return false;
    }
  }
}
