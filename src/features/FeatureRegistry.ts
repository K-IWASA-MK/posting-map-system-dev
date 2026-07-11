import { Feature } from './Feature';
import { FeaturePolicy } from './FeaturePolicy';
import { Edition } from '../licensing/Edition';
import { Role } from '../authorization/Role';
import { Permission } from '../authorization/Permission';
import { Scope } from '../authorization/Scope';

export class FeatureRegistry {
  private static registry = new Map<Feature, FeaturePolicy>();

  static {
    // 1. Google Maps Policy
    FeatureRegistry.registry.set(Feature.GOOGLE_MAPS, new FeaturePolicy({
      requiredEdition: Edition.STANDARD,
      requiredPermission: Permission.READ,
      featureToggle: 'googleMaps'
    }));

    // 2. Mapbox Policy
    FeatureRegistry.registry.set(Feature.MAPBOX, new FeaturePolicy({
      requiredEdition: Edition.STANDARD,
      requiredPermission: Permission.READ,
      featureToggle: 'mapbox'
    }));

    // 3. AIOS Bridge Policy
    FeatureRegistry.registry.set(Feature.AIOS_BRIDGE, new FeaturePolicy({
      requiredEdition: Edition.ENTERPRISE,
      requiredRole: Role.SYSTEM,
      requiredPermission: Permission.ADMIN,
      featureToggle: 'aiosBridge'
    }));

    // 4. Realtime Dashboard Policy
    FeatureRegistry.registry.set(Feature.REALTIME_DASHBOARD, new FeaturePolicy({
      requiredEdition: Edition.STANDARD,
      requiredPermission: Permission.READ,
      featureToggle: 'flyerHolding'
    }));

    // 5. Analytics Policy
    FeatureRegistry.registry.set(Feature.ANALYTICS, new FeaturePolicy({
      requiredEdition: Edition.PROFESSIONAL,
      requiredPermission: Permission.READ,
      featureToggle: 'analytics'
    }));

    // 6. CSV/JSON Data Export Policy
    FeatureRegistry.registry.set(Feature.EXPORT, new FeaturePolicy({
      requiredEdition: Edition.PROFESSIONAL,
      requiredPermission: Permission.EXPORT
    }));
  }

  public static get(feature: Feature): FeaturePolicy | null {
    return FeatureRegistry.registry.get(feature) || null;
  }

  public static has(feature: Feature): boolean {
    return FeatureRegistry.registry.has(feature);
  }
}
