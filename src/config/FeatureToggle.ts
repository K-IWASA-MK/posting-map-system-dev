export interface Features {
  readonly flyerHolding: boolean;
  readonly googleMaps: boolean;
  readonly mapbox: boolean;
  readonly gpsEvidence: boolean;
  readonly photoEvidence: boolean;
  readonly aiosBridge: boolean;
  readonly analytics: boolean;
}

export class FeatureToggle {
  private static instance: FeatureToggle | null = null;

  private constructor() {}

  static getInstance(): FeatureToggle {
    if (!FeatureToggle.instance) {
      FeatureToggle.instance = new FeatureToggle();
    }
    return FeatureToggle.instance;
  }

  getFeatures(edition: 'Standard' | 'Premium'): Features {
    const globalConfig = typeof window !== 'undefined' ? (window as any).POSTING_MAP_CONFIG : null;
    const toggles = globalConfig?.FEATURE_TOGGLES || {};

    const isPremium = edition === 'Premium';

    return {
      flyerHolding: toggles.flyerHolding !== undefined ? !!toggles.flyerHolding : true, // POSTING MAP 標準
      googleMaps: toggles.googleMaps !== undefined ? !!toggles.googleMaps : true,
      mapbox: toggles.mapbox !== undefined ? !!toggles.mapbox : isPremium,
      gpsEvidence: toggles.gpsEvidence !== undefined ? !!toggles.gpsEvidence : true,
      photoEvidence: toggles.photoEvidence !== undefined ? !!toggles.photoEvidence : true,
      aiosBridge: toggles.aiosBridge !== undefined ? !!toggles.aiosBridge : isPremium,
      analytics: toggles.analytics !== undefined ? !!toggles.analytics : isPremium
    };
  }
}
