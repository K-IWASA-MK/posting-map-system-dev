export interface ProductConfig {
  readonly productName: string;
  readonly productVersion: string;
  readonly productEdition: 'Standard' | 'Premium';
  readonly buildNumber: string;
  readonly buildDate: string;
}

export class ProductConfiguration {
  private static instance: ProductConfiguration | null = null;
  private currentConfig: ProductConfig;

  private constructor() {
    this.currentConfig = {
      productName: 'POSTING MAP',
      productVersion: '1.0.0-RC1',
      productEdition: 'Standard',
      buildNumber: 'RC-20260711',
      buildDate: '2026-07-11'
    };
  }

  static getInstance(): ProductConfiguration {
    if (!ProductConfiguration.instance) {
      ProductConfiguration.instance = new ProductConfiguration();
    }
    return ProductConfiguration.instance;
  }

  getConfig(): ProductConfig {
    const globalConfig = typeof window !== 'undefined' ? (window as any).POSTING_MAP_CONFIG : null;
    return {
      productName: globalConfig?.PRODUCT_NAME || this.currentConfig.productName,
      productVersion: globalConfig?.PRODUCT_VERSION || this.currentConfig.productVersion,
      productEdition: globalConfig?.PRODUCT_EDITION || this.currentConfig.productEdition,
      buildNumber: globalConfig?.BUILD_NUMBER || this.currentConfig.buildNumber,
      buildDate: globalConfig?.BUILD_DATE || this.currentConfig.buildDate
    };
  }
}
