import { Validator } from '../Validator';
import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { ValidationResult } from '../ValidationResult';
import { ValidationError } from '../ValidationError';
import { EndpointRegistry } from '@core/api/EndpointRegistry';
import { RouteResolver } from '@core/api/RouteResolver';

export class RouteValidator implements Validator {
  public readonly id = 'ROUTE_VALIDATOR';

  public validate(request: ApiRequest, context: ApiExecutionContext): ValidationResult {
    const validatedAt = Date.now();
    const registry = EndpointRegistry.getInstance();
    
    // Check if explicitly registered in registry
    const routeKey = RouteResolver.resolveKey(request.method, request.version, request.path);
    const routesMap = (registry as any).routes;
    
    let hasRegisteredRoute = false;
    if (routesMap) {
      if (typeof routesMap.has === 'function') {
        hasRegisteredRoute = routesMap.has(routeKey);
      } else {
        hasRegisteredRoute = routesMap[routeKey] !== undefined;
      }
    }

    if (hasRegisteredRoute) {
      return ValidationResult.success(validatedAt, 0);
    }

    // Check if it's a legacy action request mapped to the fallback handler
    const action = request.body.action || request.query.action;
    if (action) {
      return ValidationResult.success(validatedAt, 0);
    }

    return ValidationResult.failure(
      [{ code: ValidationError.ROUTE_NOT_FOUND, message: `Route "${request.method} ${request.path}" was not found.`, validatorId: this.id }],
      validatedAt,
      0
    );
  }
}
