import { SecretProvider } from './SecretProvider';
import { CoordinateCache } from './CoordinateCache';

export interface CoordinateResult {
  latitude: number;
  longitude: number;
  source: "ADDRESS_ROOFTOP" | "ADDRESS_RANGE" | "POSTAL_APPROXIMATE";
  accuracy: "A" | "B" | "C";
  confidence: number;
  rawQuery: string;
}

export class AddressCoordinateResolver {
  private cache: CoordinateCache;

  constructor() {
    this.cache = new CoordinateCache();
  }

  /**
   * Resolves coordinates by querying the Google Maps Geocoding API.
   * Uses hierarchical resolution: Exact -> Town -> Oaza.
   */
  public async resolve(city: string, town: string): Promise<CoordinateResult> {
    const addressQuery = `${city}${town}`;
    const cached = this.cache.get(addressQuery);
    
    if (cached) {
      return {
        latitude: cached.lat,
        longitude: cached.lng,
        source: cached.source as any,
        accuracy: this.mapSourceToAccuracy(cached.source),
        confidence: 1.0,
        rawQuery: addressQuery
      };
    }

    return this.fetchFromGoogle(addressQuery, addressQuery);
  }

  /**
   * Postal Code fallback
   */
  public async retryResolve(postalCode: string): Promise<CoordinateResult | null> {
    if (!postalCode) return null;
    
    const query = `〒${postalCode}`;
    const cached = this.cache.get(query);
    if (cached) {
      return {
        latitude: cached.lat,
        longitude: cached.lng,
        source: "POSTAL_APPROXIMATE",
        accuracy: "C",
        confidence: 0.5,
        rawQuery: query
      };
    }

    try {
      const res = await this.fetchFromGoogle(query, query, true);
      return res;
    } catch (e) {
      return null;
    }
  }

  private async fetchFromGoogle(query: string, cacheKey: string, isPostalFallback: boolean = false): Promise<CoordinateResult> {
    const apiKey = SecretProvider.getGoogleMapsApiKey();
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=ja`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || data.results.length === 0) {
      throw new Error(`Geocoding failed for query: ${query} (Status: ${data.status})`);
    }

    const result = data.results[0];
    const loc = result.geometry.location;
    const locType = result.geometry.location_type; // ROOFTOP, RANGE_INTERPOLATED, GEOMETRIC_CENTER, APPROXIMATE

    let source: CoordinateResult["source"] = "ADDRESS_RANGE";
    if (isPostalFallback) {
      source = "POSTAL_APPROXIMATE";
    } else if (locType === "ROOFTOP") {
      source = "ADDRESS_ROOFTOP";
    }

    const accuracy = this.mapSourceToAccuracy(source);
    const confidence = source === "ADDRESS_ROOFTOP" ? 1.0 : (source === "POSTAL_APPROXIMATE" ? 0.5 : 0.8);

    const coordResult: CoordinateResult = {
      latitude: loc.lat,
      longitude: loc.lng,
      source,
      accuracy,
      confidence,
      rawQuery: query
    };

    // Save to cache
    this.cache.set(cacheKey, {
      lat: loc.lat,
      lng: loc.lng,
      source
    });

    return coordResult;
  }

  private mapSourceToAccuracy(source: string): "A" | "B" | "C" {
    if (source === "ADDRESS_ROOFTOP") return "A";
    if (source === "POSTAL_APPROXIMATE") return "C";
    return "B";
  }
}
