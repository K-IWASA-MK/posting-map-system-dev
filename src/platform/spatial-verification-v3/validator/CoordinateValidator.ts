import { WaterAreaDetector } from './WaterAreaDetector';
import { BoundaryContainmentValidator } from './BoundaryContainmentValidator';

export type CoordinateValidationResult = {
  isValid: boolean;
  status: "VERIFIED" | "INVALID_COORDINATE" | "REJECTED_BOUNDARY_LEAK";
  reason?: string;
};

export class CoordinateValidator {
  private waterDetector: WaterAreaDetector;
  private boundaryValidator: BoundaryContainmentValidator;

  constructor() {
    this.waterDetector = new WaterAreaDetector();
    this.boundaryValidator = new BoundaryContainmentValidator();
  }

  public validate(lat: number, lng: number, city: string): CoordinateValidationResult {
    // 1. Water Check
    const waterCheck = this.waterDetector.detect(lat, lng);
    if (waterCheck.isWater) {
      return {
        isValid: false,
        status: "INVALID_COORDINATE",
        reason: `Coordinate fell into water area: ${waterCheck.waterName}`
      };
    }

    // 2. Boundary Containment Check
    const boundaryCheck = this.boundaryValidator.validate(lat, lng, city);
    if (!boundaryCheck.isContained) {
      return {
        isValid: false,
        status: "REJECTED_BOUNDARY_LEAK",
        reason: boundaryCheck.reason
      };
    }

    return {
      isValid: true,
      status: "VERIFIED"
    };
  }
}
