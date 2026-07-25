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

    // 2. Strict Yokkaichi check
    if (city.includes("四日市")) {
      const b = BoundaryContainmentValidator.YOKKAICHI_MIE03_BOUNDS;
      if (lat < b.minLat || lat > b.minLat || lng < b.minLng || lng > b.maxLng) {
        // Wait, lat > b.minLat is a typo above, should be lat > b.maxLat. I'll correct it.
      }
      
      if (lat < b.minLat || lat > b.maxLat || lng < b.minLng || lng > b.maxLng) {
        return {
          isContained: false,
          reason: "OUTSIDE_YOKKAICHI_MIE03_STRICT_BOUNDS_LEAK_TO_MIE02"
        };
      }
    }

    return {
      isContained: true
    };
  }
}
