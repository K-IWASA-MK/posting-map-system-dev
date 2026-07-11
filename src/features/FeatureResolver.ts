import { ApiRequest } from '../api/ApiRequest';
import { FeaturePolicy } from './FeaturePolicy';
import { Feature } from './Feature';
import { FeatureRegistry } from './FeatureRegistry';

export class FeatureResolver {
  public static resolve(request: ApiRequest): FeaturePolicy | null {
    const feature = FeatureResolver.resolveFeature(request);
    if (!feature) {
      return null;
    }
    return FeatureRegistry.get(feature);
  }

  public static resolveFeature(request: ApiRequest): Feature | null {
    const path = request.path;
    const action = request.query && request.query.action;

    if (path === '/dashboard' || path === '/holding') {
      return Feature.REALTIME_DASHBOARD;
    }

    if (action === 'export' || path === '/export') {
      return Feature.EXPORT;
    }

    if (path === '/maps') {
      return Feature.GOOGLE_MAPS;
    }

    if (path === '/aios') {
      return Feature.AIOS_BRIDGE;
    }

    return null;
  }
}
