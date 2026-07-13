import { ApiRequest } from '@core/api/ApiRequest';
import { IdentityProvider } from './IdentityProvider';
import { ApiKeyIdentityProvider } from './providers/ApiKeyIdentityProvider';
import { LIFFIdentityProvider } from './providers/LIFFIdentityProvider';
import { ServiceIdentityProvider } from './providers/ServiceIdentityProvider';
import { GoogleIdentityProvider } from './providers/GoogleIdentityProvider';

declare const Session: any;

export class IdentityResolver {
  public static resolve(request: ApiRequest): IdentityProvider | null {
    // 1. Service Auth (Highest priority)
    if (request.headers && request.headers['x-service-auth']) {
      return new ServiceIdentityProvider();
    }

    // 2. API Key (Medium priority)
    const hasQueryApiKey = request.query && (request.query.apiKey || request.query['x-api-key']);
    const hasHeaderApiKey = request.headers && request.headers['x-api-key'];
    if (hasQueryApiKey || hasHeaderApiKey) {
      return new ApiKeyIdentityProvider();
    }

    // 3. LIFF Token (Low priority)
    const hasQueryLiff = request.query && request.query.liffToken;
    const hasHeaderLiff = request.headers && request.headers['authorization'] && request.headers['authorization'].startsWith('Bearer ');
    if (hasQueryLiff || hasHeaderLiff) {
      return new LIFFIdentityProvider();
    }

    // 4. Google Auth (For Dashboard routes and active Google sessions)
    let hasGoogleSession = false;
    try {
      if (typeof Session !== 'undefined' && Session.getActiveUser && Session.getActiveUser().getEmail()) {
        hasGoogleSession = true;
      }
    } catch (e) {}

    const isDashboardPath = request.path && (request.path.includes('/dashboard/') || request.path.includes('/operations/'));
    if (hasGoogleSession || isDashboardPath) {
      return new GoogleIdentityProvider();
    }

    // No identity provider matched
    return null;
  }
}
