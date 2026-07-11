// =========================================
// Generated: active/gas/03_platform.gs
// =========================================

// --- Source: src/platform/PlatformExecutionContext.ts ---

class PlatformExecutionContext {
  public readonly requestId: string;
  public readonly startedAt: number;
  public readonly completedAt: number | null;
  public readonly status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  public readonly stage: PlatformStage;
  public readonly metadata: Record<string, any>;
  public readonly traceId: string | null;
  public readonly correlationId: string | null;
  public readonly executionVersion: string | null;

  constructor(params: {
    requestId: string;
    startedAt: number;
    completedAt?: number | null;
    status?: 'RUNNING' | 'COMPLETED' | 'FAILED';
    stage?: PlatformStage;
    metadata?: Record<string, any>;
    traceId?: string | null;
    correlationId?: string | null;
    executionVersion?: string | null;
  }) {
    this.requestId = params.requestId;
    this.startedAt = params.startedAt;
    this.completedAt = params.completedAt ?? null;
    this.status = params.status ?? 'RUNNING';
    this.stage = params.stage ?? PlatformStage.INITIALIZING;
    this.metadata = Object.freeze({ ...params.metadata });
    this.traceId = params.traceId ?? null;
    this.correlationId = params.correlationId ?? null;
    this.executionVersion = params.executionVersion ?? null;
  }

  public withStage(stage: PlatformStage, status?: 'RUNNING' | 'COMPLETED' | 'FAILED', completedAt?: number): PlatformExecutionContext {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: completedAt !== undefined ? completedAt : this.completedAt,
      status: status ?? this.status,
      stage: stage,
      metadata: this.metadata,
      traceId: this.traceId,
      correlationId: this.correlationId,
      executionVersion: this.executionVersion
    });
  }

  public withMetadata(metadata: Record<string, any>): PlatformExecutionContext {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      stage: this.stage,
      metadata: { ...this.metadata, ...metadata },
      traceId: this.traceId,
      correlationId: this.correlationId,
      executionVersion: this.executionVersion
    });
  }

  public withAuditIdentifiers(identifiers: { traceId?: string | null; correlationId?: string | null; executionVersion?: string | null }): PlatformExecutionContext {
    return new PlatformExecutionContext({
      requestId: this.requestId,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      stage: this.stage,
      metadata: this.metadata,
      traceId: identifiers.traceId !== undefined ? identifiers.traceId : this.traceId,
      correlationId: identifiers.correlationId !== undefined ? identifiers.correlationId : this.correlationId,
      executionVersion: identifiers.executionVersion !== undefined ? identifiers.executionVersion : this.executionVersion
    });
  }
}


// --- Source: src/platform/PlatformIntegrationPipeline.ts ---

declare function createJsonResponseFromApiResponse(apiResponse: any): any;

class PlatformIntegrationPipeline {
  public static lastContext: ApiExecutionContext | null = null;

  public static async execute(e: any): Promise<any> {
    // Bootstrap dynamic API registrations
    bootstrapFieldApis();

    const start = Date.now();
    const apiContext = new ApiExecutionContext();
    PlatformIntegrationPipeline.lastContext = apiContext;

    let platformContext = new PlatformExecutionContext({
      requestId: apiContext.getRequestId(),
      startedAt: start
    });
    apiContext.setPlatformContext(platformContext);

    // Set traceId and correlationId if present in query parameters for correlation tracing
    const queryTraceId = e.parameter?.traceId || e.parameter?.tId || null;
    const queryCorrId = e.parameter?.correlationId || e.parameter?.cId || null;
    if (queryTraceId || queryCorrId) {
      platformContext = platformContext.withAuditIdentifiers({
        traceId: queryTraceId,
        correlationId: queryCorrId,
        executionVersion: '1.0.0'
      });
      apiContext.setPlatformContext(platformContext);
    }

    ExceptionHandler.clearListeners();
    ExceptionHandler.addListener(ApiLifecycleObserver.onException);

    let apiRequest: ApiRequest | null = null;
    let apiResponse: ApiResponse;

    try {
      // Log platform started
      PlatformLifecycleObserver.onPlatformStarted(platformContext);

      // Resolve request fields
      const method = e.postData ? 'POST' : 'GET';
      let postData: any = null;
      if (method === 'POST') {
        try {
          if (e.postData && e.postData.contents) {
            postData = JSON.parse(e.postData.contents);
          } else {
            postData = e.parameter;
          }
        } catch (f) {
          postData = e.parameter;
        }
      }

      const action = (method === 'POST' ? (postData?.action || e.parameter.action) : e.parameter.action) || 'health';
      let path = (method === 'POST' ? (postData?.path || e.parameter.path) : e.parameter.path) || '';
      if (!path) {
        path = '/' + action;
        if (action === 'getAppData') {
          path = '/dashboard';
        } else if (action === 'getFlyerStock') {
          path = '/holding';
        } else if (action === 'updateFlyerStock') {
          path = '/holding';
        } else if (action === 'registerStaff') {
          path = '/field/distributors';
        } else if (action === 'updateRecordWithGPSPhoto' || action === 'submitDistribution') {
          path = '/field/distributors/activities';
        }
      }

      let queryVersion = method === 'POST' ? (postData?.version || e.parameter.version || postData?.v) : (e.parameter.version || e.parameter.v);
      if (!queryVersion && (action === 'updateRecordWithGPSPhoto' || action === 'submitDistribution' || action === 'getFlyerStock' || action === 'updateFlyerStock' || action === 'registerStaff')) {
        queryVersion = 'v2';
      }
      const version = ApiVersionResolver.resolve(undefined, queryVersion);

      apiRequest = new ApiRequest({
        method: method,
        path: path,
        version: version,
        query: e.parameter,
        body: postData,
        requestId: apiContext.getRequestId()
      });

      ApiLifecycleObserver.onStart(apiRequest, apiContext);

      // 1. HARDENING
      platformContext = platformContext.withStage(PlatformStage.HARDENING);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.HARDENING);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.HARDENING);
      const startH = Date.now();
      HardeningPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.HARDENING, Date.now() - startH);

      // 2. AUTHENTICATION
      platformContext = platformContext.withStage(PlatformStage.AUTHENTICATION);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.AUTHENTICATION);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.AUTHENTICATION);
      const startAuth = Date.now();
      AuthenticationPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.AUTHENTICATION, Date.now() - startAuth);

      // 3. AUTHORIZATION
      platformContext = platformContext.withStage(PlatformStage.AUTHORIZATION);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.AUTHORIZATION);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.AUTHORIZATION);
      const startAuthz = Date.now();
      AuthorizationPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.AUTHORIZATION, Date.now() - startAuthz);

      // 4. LICENSING
      platformContext = platformContext.withStage(PlatformStage.LICENSING);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.LICENSING);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.LICENSING);
      const startLic = Date.now();
      LicensingPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.LICENSING, Date.now() - startLic);

      // 5. FEATURE ACCESS
      platformContext = platformContext.withStage(PlatformStage.FEATURE_ACCESS);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.FEATURE_ACCESS);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.FEATURE_ACCESS);
      const startFeat = Date.now();
      FeatureAccessPipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.FEATURE_ACCESS, Date.now() - startFeat);

      // 6. AIOS BRIDGE
      platformContext = platformContext.withStage(PlatformStage.AIOS_BRIDGE);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.AIOS_BRIDGE);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.AIOS_BRIDGE);
      const startBridge = Date.now();
      AIOSBridgePipeline.getInstance().execute(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.AIOS_BRIDGE, Date.now() - startBridge);

      // 7. VALIDATION
      platformContext = platformContext.withStage(PlatformStage.VALIDATION);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.VALIDATION);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.VALIDATION);
      const startVal = Date.now();
      ValidationPipeline.getInstance().validate(apiRequest, apiContext);
      apiContext.setValidationTime(Date.now() - startVal);
      ApiLifecycleObserver.onValidationSuccess(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.VALIDATION, Date.now() - startVal);

      // 8. ROUTING
      platformContext = platformContext.withStage(PlatformStage.ROUTING);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.ROUTING);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.ROUTING);
      const startRoute = Date.now();
      EndpointRegistry.getInstance().getHandler(apiRequest.method, apiRequest.version, apiRequest.path, apiRequest);
      apiContext.setRoutingTime(Date.now() - startRoute);
      ApiLifecycleObserver.onRoutingSuccess(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.ROUTING, Date.now() - startRoute);

      // 9. HANDLER
      platformContext = platformContext.withStage(PlatformStage.HANDLER);
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.HANDLER);
      PlatformLifecycleObserver.onStageStarted(platformContext, PlatformStage.HANDLER);
      const startHandler = Date.now();

      // Workspace Subscription Gate check
      const subscriptionGate = WorkspaceSubscriptionGate.getInstance();
      if (subscriptionGate) {
        await subscriptionGate.pass(apiRequest);
      }

      const writeActions = [
        'submitDistribution',
        'updateRecordWithGPSPhoto',
        'registerStaff',
        'registerAdmin',
        'requestFlyerTransfer',
        'resolveTransferRequest',
        'updateFlyerStock',
        'resetRoster',
        'setupFolders',
        'forceStartBatch',
        'refreshCache',
        'aggregateStats',
        'resetAllSheets',
        'updateSubscription'
      ];

      const isWriteAction = (method === 'POST' && (writeActions.indexOf(action) !== -1 || path === '/field/reservation' || path === '/operations/subscriptions/update'));

      if (isWriteAction) {
        apiResponse = await LockServiceProvider.getInstance().executeWithLockAsync(async () => {
          return await ApiRouter.getInstance().route(apiRequest!, apiContext);
        });
        if (apiResponse && apiResponse.success) {
          const cacheKey = CacheServiceProvider.getInstance().makeKey(
            postData?.tenantId || e.parameter.tenantId || "DEFAULT",
            postData?.branchId || e.parameter.branchId || "DEFAULT",
            "appdata"
          );
          CacheServiceProvider.getInstance().remove(cacheKey);
        }
      } else {
        apiResponse = await ApiRouter.getInstance().route(apiRequest, apiContext);
      }

      apiContext.setHandlerTime(Date.now() - startHandler);
      ApiLifecycleObserver.onHandlerSuccess(apiRequest, apiContext);
      PlatformLifecycleObserver.onStageCompleted(platformContext, PlatformStage.HANDLER, Date.now() - startHandler);

      // Completed
      platformContext = platformContext.withStage(PlatformStage.COMPLETED, 'COMPLETED', Date.now());
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.COMPLETED);
      ApiLifecycleObserver.onComplete(apiRequest, apiResponse, apiContext);
      PlatformLifecycleObserver.onPlatformCompleted(platformContext, Date.now() - start);

    } catch (err: any) {
      // Ensure we are in FAILED state
      const activeStage = apiContext.getCurrentStage() || PlatformStage.INITIALIZING;
      platformContext = platformContext.withStage(PlatformStage.FAILED, 'FAILED', Date.now());
      apiContext.setPlatformContext(platformContext);
      apiContext.setCurrentStage(PlatformStage.FAILED);

      PlatformLifecycleObserver.onPlatformFailed(platformContext, err, activeStage);

      const req = apiRequest || new ApiRequest({
        method: e.postData ? 'POST' : 'GET',
        path: '/unknown',
        version: 'v2',
        query: e.parameter,
        requestId: apiContext.getRequestId()
      });

      apiResponse = ExceptionHandler.handle(err, req, apiContext);
    }

    return createJsonResponseFromApiResponse(apiResponse);
  }
}


// --- Source: src/platform/PlatformLifecycleObserver.ts ---

class PlatformLifecycleObserver {
  private static readonly pipeline = MonitoringPipeline.getInstance();

  public static onPlatformStarted(context: PlatformExecutionContext): void {
    PlatformLifecycleObserver.pipeline.resetSequence();
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_STARTED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { startedAt: context.startedAt }
    );
  }

  public static onStageStarted(context: PlatformExecutionContext, stage: PlatformStage): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'STAGE_STARTED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { stage }
    );
  }

  public static onStageCompleted(context: PlatformExecutionContext, stage: PlatformStage, durationMs: number): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'STAGE_COMPLETED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { stage, durationMs }
    );
  }

  public static onPlatformCompleted(context: PlatformExecutionContext, durationMs: number): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_COMPLETED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { durationMs, status: context.status }
    );
  }

  public static onPlatformFailed(context: PlatformExecutionContext, error: Error, failedStage: PlatformStage): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_FAILED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      {
        failedStage,
        errorMessage: error.message || String(error)
      }
    );
  }
}


// --- Source: src/platform/PlatformResult.ts ---

interface PlatformResult {
  readonly success: boolean;
  readonly response?: ApiResponse;
  readonly failedStage?: PlatformStage;
  readonly error?: Error;
  readonly executionContext: PlatformExecutionContext;
}


// --- Source: src/platform/PlatformStage.ts ---
enum PlatformStage {
  INITIALIZING = 'INITIALIZING',
  HARDENING = 'HARDENING',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  LICENSING = 'LICENSING',
  FEATURE_ACCESS = 'FEATURE_ACCESS',
  AIOS_BRIDGE = 'AIOS_BRIDGE',
  VALIDATION = 'VALIDATION',
  ROUTING = 'ROUTING',
  HANDLER = 'HANDLER',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}


