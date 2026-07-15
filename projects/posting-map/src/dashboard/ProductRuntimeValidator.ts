import { ProductConfiguration } from '../config/ProductConfiguration';
import { FeatureToggle } from '../config/FeatureToggle';

export interface ValidationResult {
  readonly success: boolean;
  readonly errors: string[];
}

export class ProductRuntimeValidator {
  /**
   * 起動前の全環境パラメータおよびエディション整合性の徹底検証
   */
  static validate(
    apiUrl: string,
    tenantId: string,
    branchId: string,
    targetDomId = 'app'
  ): ValidationResult {
    const errors: string[] = [];

    // 1. Browser Compatibility Verification
    const isNode = typeof globalThis !== 'undefined' && 
                   (globalThis as any).process !== undefined && 
                   (globalThis as any).process.versions && 
                   !!(globalThis as any).process.versions.node;
    if (!isNode && (typeof window === 'undefined' || typeof document === 'undefined')) {
      errors.push('Browser Compatibility: Runtime environment must be a web browser with window and document context.');
      return { success: false, errors };
    }

    // 2. 必須API URL / パラメータの検証
    if (!apiUrl) {
      errors.push('Runtime Validation: API URL (apiUrl) is required.');
    } else if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      errors.push('Runtime Validation: API URL must start with http:// or https://');
    }

    if (!tenantId) {
      errors.push('Runtime Validation: Tenant ID (tenantId) is required.');
    }
    if (!branchId) {
      errors.push('Runtime Validation: Branch ID (branchId) is required.');
    }

    // 3. 必須DOM存在確認
    if (targetDomId) {
      if (!document.getElementById(targetDomId)) {
        errors.push(`Runtime Validation: Target Mount DOM element #${targetDomId} was not found.`);
      }
    } else if (!isNode && !document.body) {
      errors.push('Runtime Validation: Document body is missing.');
    }

    // 4. ProductConfiguration / FeatureToggle 読込確認
    let configInstance: ProductConfiguration;
    let featureInstance: FeatureToggle;
    try {
      configInstance = ProductConfiguration.getInstance();
      featureInstance = FeatureToggle.getInstance();
      if (!configInstance.getConfig()) {
        errors.push('ProductConfiguration: Configuration payload is empty.');
      }
    } catch (err: any) {
      errors.push(`Initialization Failure: Failed to initialize configurations: ${err.message}`);
      return { success: false, errors };
    }

    const config = configInstance.getConfig();
    const features = featureInstance.getFeatures(config.productEdition);

    // 5. Edition Matrix Validation (Standard版でのPremium機能規制)
    if (config.productEdition === 'Standard') {
      if (features.mapbox) {
        errors.push('Edition Matrix Validation: Feature "Mapbox" is premium-only, but was enabled in Standard edition.');
      }
      if (features.aiosBridge) {
        errors.push('Edition Matrix Validation: Feature "AIOS Bridge" is premium-only, but was enabled in Standard edition.');
      }
      if (features.analytics) {
        errors.push('Edition Matrix Validation: Feature "Analytics" is premium-only, but was enabled in Standard edition.');
      }
    }

    // 6. Feature Dependency Validation
    // Google Maps が有効である場合の設定チェック
    if (features.googleMaps) {
      const globalConfig = typeof window !== 'undefined' ? (window as any).POSTING_MAP_CONFIG : null;
      const apiKeyValue = globalConfig?.MAPS_API_KEY || (typeof window !== 'undefined' ? (window as any).CONFIG?.MAPS_API_KEY : undefined);
      // 実運用の Google Maps API Key チェック (検証用ダミーキー等は警告ログとし起動は阻害しない)
      if (apiKeyValue === undefined) {
        console.warn('[ProductRuntimeValidator] WARNING: Google Maps API key (MAPS_API_KEY) is missing in config.');
      }
    }

    // マップエンジンがいずれも有効化されていない場合は起動不能
    if (!features.googleMaps && !features.mapbox) {
      errors.push('Feature Dependency Validation: At least one map engine (Google Maps or Mapbox) must be enabled.');
    }

    // AIOS Bridge が有効なら AIOS のエンドポイント設定が存在することを検証
    if (features.aiosBridge) {
      const globalConfig = typeof window !== 'undefined' ? (window as any).POSTING_MAP_CONFIG : null;
      if (!globalConfig?.AIOS_ENDPOINT) {
        errors.push('Feature Dependency Validation: AIOS Bridge is enabled, but AIOS_ENDPOINT is not configured.');
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
