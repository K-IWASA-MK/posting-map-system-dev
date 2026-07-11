import { ApiRequest } from '../api/ApiRequest';
import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { FeatureResolver } from './FeatureResolver';
import { FeatureContext } from './FeatureContext';
import { FeatureAvailability } from './FeatureAvailability';
import { EditionRank } from '../licensing/Edition';
import { FeatureException } from '../exceptions/FeatureException';
import { GasConfigurationProvider } from '../gas/GasConfigurationProvider';

export class FeatureAccessPipeline {
  private static instance: FeatureAccessPipeline | null = null;

  private constructor() {}

  public static getInstance(): FeatureAccessPipeline {
    if (!FeatureAccessPipeline.instance) {
      FeatureAccessPipeline.instance = new FeatureAccessPipeline();
    }
    return FeatureAccessPipeline.instance;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    // 1. Resolve feature requested
    const feature = FeatureResolver.resolveFeature(request);
    if (!feature) {
      return; // No specific premium/toggle features requested on this path
    }

    // 2. Resolve policy
    const policy = FeatureResolver.resolve(request);
    if (!policy) {
      return;
    }

    // 3. System feature control toggle check
    if (flags.featureAccessEnabled === false) {
      const featContext = new FeatureContext({
        feature,
        availability: FeatureAvailability.AVAILABLE,
        enabled: true
      });
      context.setFeatureContext(featContext);
      return;
    }

    // 4. Policy validation (Fail-fast evaluation)

    // 4.1 Feature Toggle Check
    if (policy.featureToggle) {
      const toggleState = (flags as any)[policy.featureToggle];
      if (toggleState === false) {
        throw new FeatureException(
          'PM-FEA-001',
          `Feature is currently disabled in system configuration: ${policy.featureToggle}`,
          request.requestId
        );
      }
    }

    // 4.2 Edition Check
    const licenseContext = context.getLicenseContext();
    if (flags.featureValidation !== false && licenseContext) {
      const userRank = EditionRank[licenseContext.edition] || 0;
      const requiredRank = EditionRank[policy.requiredEdition] || 0;
      if (userRank < requiredRank) {
        throw new FeatureException(
          'PM-FEA-002',
          `Feature requires subscription upgrade. Required: ${policy.requiredEdition} (yours: ${licenseContext.edition})`,
          request.requestId
        );
      }
    }

    // 4.3 Authorization Checks (Role / Permission / Scope)
    const authzContext = context.getAuthorizationContext();
    if (flags.featureValidation !== false && authzContext) {
      // Role requirement check
      if (policy.requiredRole && policy.requiredRole !== authzContext.role) {
        throw new FeatureException(
          'PM-FEA-003',
          `Insufficient role access. Required: ${policy.requiredRole}`,
          request.requestId
        );
      }

      // Permission check
      if (policy.requiredPermission && !authzContext.permissions.includes(policy.requiredPermission)) {
        throw new FeatureException(
          'PM-FEA-003',
          `Required permission missing. Required: ${policy.requiredPermission}`,
          request.requestId
        );
      }

      // Scope check
      if (policy.requiredScope && !authzContext.scopes.includes(policy.requiredScope)) {
        throw new FeatureException(
          'PM-FEA-003',
          `Insufficient scope data boundaries. Required: ${policy.requiredScope}`,
          request.requestId
        );
      }
    }

    // 5. Build and Bind Feature Context
    const featContext = new FeatureContext({
      feature,
      availability: FeatureAvailability.AVAILABLE,
      enabled: true,
      metadata: {
        evaluationTime: Date.now(),
        policyResolver: 'FeatureResolver'
      }
    });
    context.setFeatureContext(featContext);
  }
}
