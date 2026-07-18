export interface SystemConfig {
  syncIntervalMs: number;
  gpsTrackingIntervalMs: number;
  defaultZoom: number;
  map: {
    center: null;
  };
}

export interface AppFeatures {
  offlineMapEnabled: boolean;
  gpsPhotoVerificationEnabled: boolean;
}

export interface AppConfig {
  mode: 'DEV' | 'PROD' | 'STAGING';
  features: AppFeatures;
}

export interface BranchConfig {
  system: SystemConfig;
  app: AppConfig;
}

export class BranchConfigHelper {
  public static createDefault(): BranchConfig {
    return {
      system: {
        syncIntervalMs: 30000,
        gpsTrackingIntervalMs: 10000,
        defaultZoom: 13,
        map: {
          center: null // Coordinates resolution is decoupled from Data Builder
        }
      },
      app: {
        mode: 'PROD',
        features: {
          offlineMapEnabled: true,
          gpsPhotoVerificationEnabled: true
        }
      }
    };
  }
}
