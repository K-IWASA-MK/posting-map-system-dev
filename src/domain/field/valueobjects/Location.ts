export class Location {
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly accuracy: number;

  constructor(latitude: number, longitude: number, accuracy: number) {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90 degrees");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180 degrees");
    }
    if (accuracy < 0) {
      throw new Error("Accuracy cannot be negative");
    }
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
  }

  public equals(other: Location): boolean {
    return this.latitude === other.latitude &&
           this.longitude === other.longitude &&
           this.accuracy === other.accuracy;
  }
}
