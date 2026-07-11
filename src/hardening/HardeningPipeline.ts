import { ApiRequest } from '../api/ApiRequest';
import { ApiExecutionContext } from '../gas/ApiExecutionContext';
import { ReadinessValidator } from './ReadinessValidator';
import { CircuitBreakerFoundation } from './CircuitBreakerFoundation';
import { RequestGuard, GuardResult } from './RequestGuard';
import { ResourceGuard } from './ResourceGuard';
import { ApiException } from '../exceptions/ApiException';
import { ExceptionCategory } from '../exceptions/ExceptionCategory';

export class HardeningException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, status: number, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'HardeningException',
        exceptionCode: code,
        source: 'HARDENING_PIPELINE'
      }
    });
    this.code = code;
    this.status = status;
  }
}

export class HardeningPipeline {
  private static instance: HardeningPipeline | null = null;

  private constructor() {}

  public static getInstance(): HardeningPipeline {
    if (!HardeningPipeline.instance) {
      HardeningPipeline.instance = new HardeningPipeline();
    }
    return HardeningPipeline.instance;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    // 1. Readiness Check
    const readiness = ReadinessValidator.validate();
    if (!readiness.allowed) {
      throw new HardeningException(
        'PM-HRD-RDY',
        readiness.status || 500,
        readiness.reason || 'Readiness validation failed',
        request.requestId
      );
    }

    // 2. Circuit Breaker Check
    const circuit = CircuitBreakerFoundation.getInstance().check();
    if (!circuit.allowed) {
      throw new HardeningException(
        'PM-HRD-CBT',
        circuit.status || 503,
        circuit.reason || 'Circuit Breaker Blocked',
        request.requestId
      );
    }

    // 3. Request Guard Check
    const requestGuard = RequestGuard.check(request);
    if (!requestGuard.allowed) {
      throw new HardeningException(
        'PM-HRD-REQ',
        requestGuard.status || 400,
        requestGuard.reason || 'Request validation rejected',
        request.requestId
      );
    }

    // 4. Resource Guard Check
    const resourceGuard = ResourceGuard.check(context);
    if (!resourceGuard.allowed) {
      throw new HardeningException(
        'PM-HRD-RSC',
        resourceGuard.status || 500,
        resourceGuard.reason || 'Resource limits exceeded',
        request.requestId
      );
    }
  }
}
