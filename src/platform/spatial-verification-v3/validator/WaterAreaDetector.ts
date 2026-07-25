export type WaterCheckResult = {
  isWater: boolean;
  waterName?: string;
  severity: "ERROR" | "WARNING" | "PASS";
};

export class WaterAreaDetector {
  /**
   * Detects if the given coordinates fall into known major river water bodies
   * in the MIE-03 district (Ibi River, Nagara River, Kiso River).
   */
  public detect(lat: number, lng: number): WaterCheckResult {
    // Ibi River Water Channel
    if (lat >= 35.0200 && lat <= 35.1300 && lng >= 136.6900 && lng <= 136.7010) {
      return {
        isWater: true,
        waterName: "Ibi River (揖斐川)",
        severity: "ERROR"
      };
    }
    
    // Nagara / Kiso River Water Channel
    if (lat >= 35.0200 && lat <= 35.1300 && lng >= 136.7100 && lng <= 136.7210) {
      return {
        isWater: true,
        waterName: "Nagara/Kiso River (長良川/木曽川)",
        severity: "ERROR"
      };
    }

    return {
      isWater: false,
      severity: "PASS"
    };
  }
}
