import * as crypto from 'crypto';

export type ResolutionResult = {
  lat: number;
  lng: number;
  source: "ADDRESS_MATCH" | "TOWN_CENTROID" | "OAZA_CENTROID" | "MUNICIPALITY_CENTER";
  accuracy: "A" | "B" | "C" | "D";
};

export class AddressCoordinateResolver {
  private static readonly CITY_LAND_BOUNDS: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
    "桑名市": { minLat: 35.0450, maxLat: 35.0880, minLng: 136.6350, maxLng: 136.6880 },
    "桑名市_長島": { minLat: 35.0350, maxLat: 35.0650, minLng: 136.7020, maxLng: 136.7090 },
    "四日市市（一部）": { minLat: 34.9900, maxLat: 35.0200, minLng: 136.6350, maxLng: 136.6620 },
    "いなべ市": { minLat: 35.1200, maxLat: 35.2000, minLng: 136.4800, maxLng: 136.5600 },
    "東員町": { minLat: 35.0650, maxLat: 35.0950, minLng: 136.5750, maxLng: 136.6050 },
    "木曽岬町": { minLat: 35.0700, maxLat: 35.0900, minLng: 136.7220, maxLng: 136.7350 },
    "菰野町": { minLat: 35.0000, maxLat: 35.0300, minLng: 136.5000, maxLng: 136.5350 },
    "朝日町": { minLat: 35.0280, maxLat: 35.0420, minLng: 136.6550, maxLng: 136.6750 },
    "川越町": { minLat: 35.0180, maxLat: 35.0300, minLng: 136.6680, maxLng: 136.6850 }
  };

  /**
   * Resolves the coordinate for a given address with priority:
   * ① Exact Address -> ② Town Centroid -> ③ Oaza Centroid -> ④ Municipality Center
   * Note: This is an offline mock implementation returning deterministic points.
   */
  public resolve(areaId: string, city: string, town: string, index: number = 0): ResolutionResult {
    let boundsKey = city;
    if (town.includes('長島町')) boundsKey = '桑名市_長島';
    
    // Simulate hierarchy logic
    // For MIE-03, we mock "TOWN_CENTROID" for accurate enough representation.
    const source = "TOWN_CENTROID";
    const accuracy = "B";

    const b = AddressCoordinateResolver.CITY_LAND_BOUNDS[boundsKey] || AddressCoordinateResolver.CITY_LAND_BOUNDS['桑名市'];
    const cols = 20;
    const row = Math.floor(index / cols);
    const col = index % cols;

    let lat = b.minLat + (row * 0.0011) % (b.maxLat - b.minLat);
    let lng = b.minLng + (col * 0.0015) % (b.maxLng - b.minLng);

    // Apply deterministic micro-jitter (max tens of meters) for visualization improvements
    // Does NOT move points across physical boundaries or fix water issues.
    const { jitterLat, jitterLng } = this.calculateJitter(areaId, town);
    lat = parseFloat((lat + jitterLat).toFixed(6));
    lng = parseFloat((lng + jitterLng).toFixed(6));

    return { lat, lng, source, accuracy };
  }

  private calculateJitter(areaId: string, town: string): { jitterLat: number, jitterLng: number } {
    const hashStr = `${areaId}:${town}`;
    const hashVal = parseInt(crypto.createHash('md5').update(hashStr).digest('hex').substring(0, 4), 16);
    const jitterLat = ((hashVal % 50) - 25) * 0.00008;
    const jitterLng = (((hashVal >> 4) % 50) - 25) * 0.00008;
    return { jitterLat, jitterLng };
  }

  /**
   * Used when standard resolution fails (e.g. falls in water).
   * Attempts a fallback resolution, normally by expanding the search or using 
   * higher level centroids. If it still fails, it throws or returns undefined.
   */
  public retryResolve(areaId: string, city: string, town: string, attempt: number): ResolutionResult | null {
    if (attempt >= 3) return null; // Max retries exceeded
    
    // For the mock, we simulate an alternative deterministic point (e.g., using attempt as offset)
    const result = this.resolve(areaId, city, town, 9999 + attempt);
    // Demote accuracy due to retry (e.g. falling back to Oaza or Municipality)
    result.source = attempt === 1 ? "OAZA_CENTROID" : "MUNICIPALITY_CENTER";
    result.accuracy = attempt === 1 ? "C" : "D";
    return result;
  }
}
