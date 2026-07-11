import { AuthenticationContext } from '../authentication/AuthenticationContext';
import { AuthorizationContext } from '../authorization/AuthorizationContext';

export class ApiExecutionContext {
  private requestId: string;
  private executionId: string;
  private startTimestamp: number;
  private retryCount: number = 0;
  private authContext: AuthenticationContext | null = null;
  private authzContext: AuthorizationContext | null = null;

  constructor() {
    this.startTimestamp = Date.now();
    this.requestId = `req-${this.startTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
    this.executionId = `exec-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validationTime: number = 0;
  private routingTime: number = 0;
  private handlerTime: number = 0;

  public getRequestId(): string {
    return this.requestId;
  }

  public getExecutionId(): string {
    return this.executionId;
  }

  public getStartTimestamp(): number {
    return this.startTimestamp;
  }

  public getElapsedTime(): number {
    return Date.now() - this.startTimestamp;
  }

  public getRetryCount(): number {
    return this.retryCount;
  }

  public incrementRetry(): void {
    this.retryCount++;
  }

  public setValidationTime(ms: number): void {
    this.validationTime = ms;
  }

  public getValidationTime(): number {
    return this.validationTime;
  }

  public setRoutingTime(ms: number): void {
    this.routingTime = ms;
  }

  public getRoutingTime(): number {
    return this.routingTime;
  }

  public setHandlerTime(ms: number): void {
    this.handlerTime = ms;
  }

  public getHandlerTime(): number {
    return this.handlerTime;
  }

  public setAuthenticationContext(context: AuthenticationContext): void {
    this.authContext = context;
  }

  public getAuthenticationContext(): AuthenticationContext | null {
    return this.authContext;
  }

  public setAuthorizationContext(context: AuthorizationContext): void {
    this.authzContext = context;
  }

  public getAuthorizationContext(): AuthorizationContext | null {
    return this.authzContext;
  }
}
