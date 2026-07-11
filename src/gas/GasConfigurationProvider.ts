export interface FeatureFlags {
  flyerHolding: boolean;
  googleMaps: boolean;
  mapbox: boolean;
  gpsEvidence: boolean;
  photoEvidence: boolean;
  aiosBridge: boolean;
  analytics: boolean;
}

export class GasConfigurationProvider {
  private static instance: GasConfigurationProvider | null = null;
  private cacheTTL: number = 600; // 10 minutes
  private lockTimeout: number = 10000; // 10 seconds
  private apiVersion: string = "1.0.0-RC1";

  private constructor() {
    this.loadProperties();
  }

  public static getInstance(): GasConfigurationProvider {
    if (!GasConfigurationProvider.instance) {
      GasConfigurationProvider.instance = new GasConfigurationProvider();
    }
    return GasConfigurationProvider.instance;
  }

  private loadProperties(): void {
    if (typeof PropertiesService !== 'undefined') {
      try {
        const props = PropertiesService.getScriptProperties();
        const ttl = props.getProperty('CACHE_TTL');
        if (ttl) this.cacheTTL = parseInt(ttl, 10);

        const timeout = props.getProperty('LOCK_TIMEOUT');
        if (timeout) this.lockTimeout = parseInt(timeout, 10);
      } catch (e) {
        // Fallback for non-GAS runtimes (e.g. testing)
      }
    }
  }

  public getCacheTTL(): number {
    return this.cacheTTL;
  }

  public getLockTimeout(): number {
    return this.lockTimeout;
  }

  public getApiVersion(): string {
    return this.apiVersion;
  }

  public getSpreadsheetId(): string {
    if (typeof PropertiesService !== 'undefined') {
      const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
      if (id) return id;
    }
    return 'MOCK_SPREADSHEET_ID';
  }

  public getStorageParentFolderId(): string {
    if (typeof PropertiesService !== 'undefined') {
      const id = PropertiesService.getScriptProperties().getProperty('STORAGE_PARENT_ID');
      if (id) return id;
    }
    return 'MOCK_STORAGE_PARENT_ID';
  }

  public getFeatureFlags(): FeatureFlags {
    return {
      flyerHolding: true,
      googleMaps: true,
      mapbox: false,
      gpsEvidence: true,
      photoEvidence: true,
      aiosBridge: false,
      analytics: false
    };
  }
}

// Global declaration for GAS type safety during compiler checks
declare const PropertiesService: any;
