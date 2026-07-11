import { GuardResult } from './RequestGuard';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreakerFoundation {
  private static instance: CircuitBreakerFoundation | null = null;
  private state: CircuitState = 'CLOSED';
  private reason: string | null = null;

  private constructor() {}

  public static getInstance(): CircuitBreakerFoundation {
    if (!CircuitBreakerFoundation.instance) {
      CircuitBreakerFoundation.instance = new CircuitBreakerFoundation();
    }
    return CircuitBreakerFoundation.instance;
  }

  public getState(): CircuitState {
    return this.state;
  }

  public getReason(): string | null {
    return this.reason;
  }

  public transitionTo(state: CircuitState, reason: string | null = null): void {
    this.state = state;
    this.reason = reason;
  }

  public check(): GuardResult {
    if (this.state === 'OPEN') {
      return {
        allowed: false,
        reason: `Circuit Breaker is OPEN. Reason: ${this.reason || 'UNKNOWN'}`,
        status: 503
      };
    }
    return { allowed: true };
  }
}
