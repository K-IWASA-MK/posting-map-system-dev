export type BoundaryCheckResult = {
  isContained: boolean;
  reason?: string;
};

export class BoundaryContainmentValidator {
  /**
   * Yokkaichi MIE-03 (North Yokkaichi - Tomita, Tomisuhara, Hazu)
   * This is a simplified strict bounding box for Yokkaichi MIE-03 to prevent 
   * MIE-02 (South Yokkaichi) leakage.
   */
  private static readonly YOKKAICHI_MIE03_BOUNDS = {
    minLat: 34.9900, maxLat: 35.0200,
    minLng: 136.6350, maxLng: 136.6620
  };

  /**
   * General MIE-03 broad bounding box (Kuwana, Inabe, Toin, Komono, Asahi, Kawagoe, Kisosaki)
   */
  private static readonly MIE03_BROAD_BOUNDS = {
    minLat: 34.9500, maxLat: 35.2500,
    minLng: 136.4500, maxLng: 136.7500
  };

  public validate(lat: number, lng: number, city: string): BoundaryCheckResult {
    // 1. Broad district containment check
    if (lat < BoundaryContainmentValidator.MIE03_BROAD_BOUNDS.minLat || lat > BoundaryContainmentValidator.MIE03_BROAD_BOUNDS.maxLat ||
        lng < BoundaryContainmentValidator.MIE03_BROAD_BOUNDS.minLng || lng > BoundaryContainmentValidator.MIE03_BROAD_BOUNDS.maxLng) {
      return {
        isContained: false,
        reason: "OUTSIDE_MIE03_BROAD_BOUNDS"
      };
    }

    return {
      isContained: true
    };
  }
}
