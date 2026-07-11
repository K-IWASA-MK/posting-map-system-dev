export interface FeatureFlags {
  flyerHolding: boolean;
  googleMaps: boolean;
  mapbox: boolean;
  gpsEvidence: boolean;
  photoEvidence: boolean;
  aiosBridge: boolean;
  analytics: boolean;
  apiKeyAuth: boolean;
  liffAuth: boolean;
  serviceAuth: boolean;
  anonymousAccess: boolean;
  authorizationEnabled: boolean;
  roleValidation: boolean;
  scopeValidation: boolean;
  permissionValidation: boolean;
  licensingEnabled: boolean;
  editionValidation: boolean;
  licenseValidation: boolean;
  featureAccessEnabled: boolean;
  featureValidation: boolean;
  bridgeEnabled: boolean;
  bridgeHeartbeat: boolean;
  bridgeTimeout: number;
  bridgeProvider: string;
  platformIntegrationEnabled: boolean;
  pipelineMode: string;
  debugExecutionTrace: boolean;
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

  public getFieldRepositoryMode(): string {
    if (typeof PropertiesService !== 'undefined') {
      const mode = PropertiesService.getScriptProperties().getProperty('FIELD_REPOSITORY_MODE');
      if (mode) return mode;
    }
    return 'SPREADSHEET';
  }

  public getStorageParentFolderId(): string {
    if (typeof PropertiesService !== 'undefined') {
      const id = PropertiesService.getScriptProperties().getProperty('STORAGE_PARENT_ID');
      if (id) return id;
    }
    return 'MOCK_STORAGE_PARENT_ID';
  }

  public getFeatureFlags(): FeatureFlags {
    if (typeof PropertiesService !== 'undefined') {
      try {
        const props = PropertiesService.getScriptProperties();
        const timeoutStr = props.getProperty('BRIDGE_TIMEOUT');
        return {
          flyerHolding: props.getProperty('FLAG_FLYER_HOLDING') !== 'false',
          googleMaps: props.getProperty('FLAG_GOOGLE_MAPS') !== 'false',
          mapbox: props.getProperty('FLAG_MAPBOX') === 'true',
          gpsEvidence: props.getProperty('FLAG_GPS_EVIDENCE') !== 'false',
          photoEvidence: props.getProperty('FLAG_PHOTO_EVIDENCE') !== 'false',
          aiosBridge: props.getProperty('FLAG_AIOS_BRIDGE') === 'true',
          analytics: props.getProperty('FLAG_ANALYTICS') === 'true',
          apiKeyAuth: props.getProperty('FLAG_API_KEY_AUTH') !== 'false',
          liffAuth: props.getProperty('FLAG_LIFF_AUTH') !== 'false',
          serviceAuth: props.getProperty('FLAG_SERVICE_AUTH') !== 'false',
          anonymousAccess: props.getProperty('FLAG_ANONYMOUS_ACCESS') !== 'false',
          authorizationEnabled: props.getProperty('FLAG_AUTHORIZATION_ENABLED') !== 'false',
          roleValidation: props.getProperty('FLAG_ROLE_VALIDATION') !== 'false',
          scopeValidation: props.getProperty('FLAG_SCOPE_VALIDATION') !== 'false',
          permissionValidation: props.getProperty('FLAG_PERMISSION_VALIDATION') !== 'false',
          licensingEnabled: props.getProperty('FLAG_LICENSING_ENABLED') !== 'false',
          editionValidation: props.getProperty('FLAG_EDITION_VALIDATION') !== 'false',
          licenseValidation: props.getProperty('FLAG_LICENSE_VALIDATION') !== 'false',
          featureAccessEnabled: props.getProperty('FLAG_FEATURE_ACCESS_ENABLED') !== 'false',
          featureValidation: props.getProperty('FLAG_FEATURE_VALIDATION') !== 'false',
          bridgeEnabled: props.getProperty('FLAG_BRIDGE_ENABLED') !== 'false',
          bridgeHeartbeat: props.getProperty('FLAG_BRIDGE_HEARTBEAT') !== 'false',
          bridgeTimeout: timeoutStr ? parseInt(timeoutStr, 10) : 5000,
          bridgeProvider: props.getProperty('FLAG_BRIDGE_PROVIDER') || 'AIOSBridgeProvider',
          platformIntegrationEnabled: props.getProperty('FLAG_PLATFORM_INTEGRATION_ENABLED') !== 'false',
          pipelineMode: props.getProperty('FLAG_PIPELINE_MODE') || 'DETERMINISTIC',
          debugExecutionTrace: props.getProperty('FLAG_DEBUG_EXECUTION_TRACE') !== 'false'
        };
      } catch (e) {
        // Fallback below
      }
    }
    return {
      flyerHolding: true,
      googleMaps: true,
      mapbox: false,
      gpsEvidence: true,
      photoEvidence: true,
      aiosBridge: false,
      analytics: false,
      apiKeyAuth: true,
      liffAuth: true,
      serviceAuth: true,
      anonymousAccess: true,
      authorizationEnabled: true,
      roleValidation: true,
      scopeValidation: true,
      permissionValidation: true,
      licensingEnabled: true,
      editionValidation: true,
      licenseValidation: true,
      featureAccessEnabled: true,
      featureValidation: true,
      bridgeEnabled: true,
      bridgeHeartbeat: true,
      bridgeTimeout: 5000,
      bridgeProvider: 'AIOSBridgeProvider',
      platformIntegrationEnabled: true,
      pipelineMode: 'DETERMINISTIC',
      debugExecutionTrace: true
    };
  }
}

// Global declaration for GAS type safety during compiler checks
declare const PropertiesService: any;
