import { AuthenticationContext } from '@foundation/authentication/AuthenticationContext';
import { AuthorizationContext } from '@foundation/authorization/AuthorizationContext';
import { LicenseContext } from '@foundation/licensing/LicenseContext';
import { FeatureContext } from '@foundation/features/FeatureContext';
import { BridgeContext } from '@foundation/bridge/BridgeContext';
import { PlatformExecutionContext } from '../../platform/PlatformExecutionContext';
import { PlatformStage } from '../../platform/PlatformStage';

export class ApiExecutionContext {
  private requestId: string;
  private executionId: string;
  private startTimestamp: number;
  private retryCount: number = 0;
  private authContext: AuthenticationContext | null = null;
  private authzContext: AuthorizationContext | null = null;
  private licenseContext: LicenseContext | null = null;
  private featureContext: FeatureContext | null = null;
  private bridgeContext: BridgeContext | null = null;
  private platformCtx: PlatformExecutionContext | null = null;
  private currentStage: PlatformStage = PlatformStage.INITIALIZING;

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

  public setLicenseContext(context: LicenseContext): void {
    this.licenseContext = context;
  }

  public getLicenseContext(): LicenseContext | null {
    return this.licenseContext;
  }

  public setFeatureContext(context: FeatureContext): void {
    this.featureContext = context;
  }

  public getFeatureContext(): FeatureContext | null {
    return this.featureContext;
  }

  public setBridgeContext(context: BridgeContext): void {
    this.bridgeContext = context;
  }

  public getBridgeContext(): BridgeContext | null {
    return this.bridgeContext;
  }

  public setPlatformContext(context: PlatformExecutionContext): void {
    this.platformCtx = context;
  }

  public getPlatformContext(): PlatformExecutionContext | null {
    return this.platformCtx;
  }

  public setCurrentStage(stage: PlatformStage): void {
    this.currentStage = stage;
  }

  public getCurrentStage(): PlatformStage {
    return this.currentStage;
  }
}
