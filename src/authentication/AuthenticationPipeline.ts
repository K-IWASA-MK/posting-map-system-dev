import { ApiRequest } from '../api/ApiRequest';
import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { IdentityResolver } from './IdentityResolver';
import { AuthenticationPolicy } from './AuthenticationPolicy';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from './AuthenticationContext';
import { AuthenticationException } from '../exceptions/AuthenticationException';
import { GasConfigurationProvider } from '../gas/GasConfigurationProvider';

export class AuthenticationPipeline {
  private static instance: AuthenticationPipeline | null = null;

  private constructor() {}

  public static getInstance(): AuthenticationPipeline {
    if (!AuthenticationPipeline.instance) {
      AuthenticationPipeline.instance = new AuthenticationPipeline();
    }
    return AuthenticationPipeline.instance;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    const provider = IdentityResolver.resolve(request);

    if (provider) {
      // Feature toggle checks based on provider type
      const isApiKey = provider.constructor.name === 'ApiKeyIdentityProvider';
      const isLiff = provider.constructor.name === 'LIFFIdentityProvider';
      const isService = provider.constructor.name === 'ServiceIdentityProvider';

      if ((isApiKey && flags.apiKeyAuth === false) ||
          (isLiff && flags.liffAuth === false) ||
          (isService && flags.serviceAuth === false)) {
        // Disabled auth provider behaves as if no credentials were provided
        this.handleNoCredentials(request, context, flags.anonymousAccess);
        return;
      }

      const result = provider.authenticate(request);

      if (result.success && result.context) {
        context.setAuthenticationContext(result.context);
      } else {
        // Validation failed. If anonymous access is allowed, fallback.
        const allowAnonymous = flags.anonymousAccess && AuthenticationPolicy.isAnonymousAllowed(request);
        if (allowAnonymous) {
          const anonContext = new AuthenticationContext({
            identityId: 'anonymous',
            identityType: IdentityType.ANONYMOUS,
            authenticationMethod: AuthenticationMethod.NONE,
            authenticated: false,
            issuedAt: Date.now()
          });
          context.setAuthenticationContext(anonContext);
        } else {
          const errCode = isApiKey ? 'PM-AUT-002' : isLiff ? 'PM-AUT-003' : 'PM-AUT-004';
          throw new AuthenticationException(
            errCode,
            result.failureReason || 'Authentication verification failed',
            request.requestId
          );
        }
      }
    } else {
      this.handleNoCredentials(request, context, flags.anonymousAccess);
    }
  }

  private handleNoCredentials(request: ApiRequest, context: ApiExecutionContext, anonymousFlag: boolean): void {
    const allowAnonymous = anonymousFlag && AuthenticationPolicy.isAnonymousAllowed(request);
    if (allowAnonymous) {
      const anonContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: IdentityType.ANONYMOUS,
        authenticationMethod: AuthenticationMethod.NONE,
        authenticated: false,
        issuedAt: Date.now()
      });
      context.setAuthenticationContext(anonContext);
    } else {
      throw new AuthenticationException(
        'PM-AUT-001',
        'Authentication required. No valid credentials provided.',
        request.requestId
      );
    }
  }
}
