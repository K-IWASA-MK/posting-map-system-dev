import { Validator } from '../Validator';
import { ApiRequest } from '../../api/ApiRequest';
import { ApiExecutionContext } from '../../gas/ApiExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { ValidationError } from '../ValidationError';
import { GasConfigurationProvider } from '../../gas/GasConfigurationProvider';

export class FeatureValidator implements Validator {
  public readonly id = 'FEATURE_VALIDATOR';

  public validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult {
    const validatedAt = Date.now();
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    // Check flyer holding feature toggle
    if (request.path === '/holding' && !flags.flyerHolding) {
      return ValidationResult.failure(
        [{ code: ValidationError.FEATURE_DISABLED, message: 'Held Flyers feature is currently disabled.', validatorId: this.id }],
        validatedAt,
        0
      );
    }

    // Check mapping engine feature toggle
    if (request.path === '/dashboard' && !flags.googleMaps && !flags.mapbox) {
      return ValidationResult.failure(
        [{ code: ValidationError.FEATURE_DISABLED, message: 'Map engine feature is currently disabled.', validatorId: this.id }],
        validatedAt,
        0
      );
    }

    return ValidationResult.success(validatedAt, 0);
  }
}
