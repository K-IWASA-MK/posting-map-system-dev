// =========================================
// Generated: active/gas/00_core.gs
// =========================================

// --- Source: src/core/eventbus/GovernanceEvent.ts ---

interface GovernanceEvent {
  id: string;
  type: GovernanceEventType;
  source: string;
  payload: Record<string, any>;
  timestamp: Date;
  priority: GovernanceEventPriority;
  context: GovernanceEventContext;
}


// --- Source: src/core/eventbus/GovernanceEventBusEngine.ts ---

interface IGovernanceEventBusEngine {
  publish(event: GovernanceEvent): Promise<boolean>;
  subscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  unsubscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  emit(event: GovernanceEvent): Promise<boolean>;
}

abstract class BaseGovernanceEventBusEngine implements IGovernanceEventBusEngine {
  abstract publish(event: GovernanceEvent): Promise<boolean>;
  abstract subscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  abstract unsubscribe(type: GovernanceEventType, listener: Function): Promise<boolean>;
  abstract emit(event: GovernanceEvent): Promise<boolean>;
}


// --- Source: src/core/eventbus/GovernanceEventContext.ts ---
interface GovernanceEventContext {
  runtimeId: string;
  phase: string;
  module: string;
  correlationId: string;
}


// --- Source: src/core/eventbus/GovernanceEventDispatcher.ts ---

class GovernanceEventDispatcher {
  public async dispatch(event: GovernanceEvent): Promise<boolean> {
    return true;
  }

  public async route(event: GovernanceEvent, target: Function): Promise<boolean> {
    return true;
  }

  public async resolveTarget(event: GovernanceEvent): Promise<Function[]> {
    return [];
  }
}


// --- Source: src/core/eventbus/GovernanceEventPriority.ts ---
enum GovernanceEventPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}


// --- Source: src/core/eventbus/GovernanceEventRegistry.ts ---

class GovernanceEventRegistry {
  private listeners: Map<GovernanceEventType, Function[]> = new Map();

  public async addListener(type: GovernanceEventType, listener: Function): Promise<boolean> {
    return true;
  }

  public async removeListener(type: GovernanceEventType, listener: Function): Promise<boolean> {
    return true;
  }

  public async getListeners(type: GovernanceEventType): Promise<Function[]> {
    return [];
  }

  public async listEvents(): Promise<string[]> {
    return [];
  }
}


// --- Source: src/core/eventbus/GovernanceEventType.ts ---
enum GovernanceEventType {
  KNOWLEDGE_EVENT = "KNOWLEDGE_EVENT",
  POLICY_EVENT = "POLICY_EVENT",
  REVIEW_EVENT = "REVIEW_EVENT",
  SCOPE_EVENT = "SCOPE_EVENT",
  SYSTEM_EVENT = "SYSTEM_EVENT"
}


// --- Source: src/core/exceptions/ApiException.ts ---

abstract class ApiException extends Error {
  public abstract readonly category: ExceptionCategory;
  public abstract readonly code: string;
  public abstract readonly status: number;
  public readonly internalMessage: string;
  public readonly externalMessage: string;
  public readonly metadata: ExceptionMetadata;

  constructor(params: {
    internalMessage: string;
    externalMessage: string;
    metadata: ExceptionMetadata;
  }) {
    super(params.internalMessage);
    this.name = this.constructor.name;
    this.internalMessage = params.internalMessage;
    this.externalMessage = params.externalMessage;
    this.metadata = params.metadata;

    // TypeScript/ES5 target hack to fix prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


// --- Source: src/core/exceptions/AuthenticationException.ts ---

class AuthenticationException extends ApiException {
  public readonly category = ExceptionCategory.AUTHENTICATION;
  public readonly code: string;
  public readonly status: number = 401;

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage, // For simple authentication, user-facing and internal can align or hide sensitive details
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'AuthenticationException',
        exceptionCode: code,
        source: 'AUTHENTICATION_PIPELINE'
      }
    });
    this.code = code;
  }
}


// --- Source: src/core/exceptions/AuthorizationException.ts ---

class AuthorizationException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM; // We map it as standard exception lifecycle
  public readonly code: string;
  public readonly status: number = 403;

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'AuthorizationException',
        exceptionCode: code,
        source: 'AUTHORIZATION_PIPELINE'
      }
    });
    this.code = code;
  }
}


// --- Source: src/core/exceptions/BridgeException.ts ---

class BridgeException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code: string;
  public readonly status: number = 503; // Service Unavailable default

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'BridgeException',
        exceptionCode: code,
        source: 'AIOS_BRIDGE_PIPELINE'
      }
    });
    this.code = code;
  }
}


// --- Source: src/core/exceptions/ConfigurationException.ts ---

class ConfigurationException extends ApiException {
  public readonly category = ExceptionCategory.CONFIGURATION;
  public readonly code = 'PM-CFG-001';
  public readonly status = 500;

  constructor(internalMessage: string, requestId: string, details?: string) {
    super({
      internalMessage,
      externalMessage: 'システム設定エラーが発生しました。',
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'ConfigurationException',
        exceptionCode: 'PM-CFG-001',
        source: 'CONFIGURATION',
        details
      }
    });
  }
}


// --- Source: src/core/exceptions/ExceptionCategory.ts ---
type ExceptionCategory =
  | 'VALIDATION'
  | 'ROUTING'
  | 'SYSTEM'
  | 'CONFIGURATION'
  | 'FEATURE'
  | 'AUTHENTICATION';

const ExceptionCategory = {
  VALIDATION: 'VALIDATION' as ExceptionCategory,
  ROUTING: 'ROUTING' as ExceptionCategory,
  SYSTEM: 'SYSTEM' as ExceptionCategory,
  CONFIGURATION: 'CONFIGURATION' as ExceptionCategory,
  FEATURE: 'FEATURE' as ExceptionCategory,
  AUTHENTICATION: 'AUTHENTICATION' as ExceptionCategory,
};


// --- Source: src/core/exceptions/ExceptionHandler.ts ---

class ExceptionHandler {
  // S3-5 Integration: Event hook point for monitoring and audit logging
  private static onExceptionListeners: Array<
    (error: Error, request: ApiRequest, context: ApiExecutionContext) => void
  > = [];

  public static addListener(
    listener: (error: Error, request: ApiRequest, context: ApiExecutionContext) => void
  ): void {
    ExceptionHandler.onExceptionListeners.push(listener);
  }

  public static clearListeners(): void {
    ExceptionHandler.onExceptionListeners = [];
  }

  public static handle(
    error: Error,
    request: ApiRequest,
    context: ApiExecutionContext
  ): ApiResponse {
    // 1. Trigger monitoring and auditing hooks
    for (const listener of ExceptionHandler.onExceptionListeners) {
      try {
        listener(error, request, context);
      } catch (hookErr) {
        console.error('[ExceptionHandler Hook Error]', hookErr);
      }
    }

    // 2. Perform exception to ApiResponse mapping
    return ExceptionMapper.toResponse(error, request, context);
  }
}


// --- Source: src/core/exceptions/ExceptionMapper.ts ---

class ExceptionMapper {
  public static toResponse(
    error: Error,
    request: ApiRequest,
    context: ApiExecutionContext
  ): ApiResponse {
    let apiException: ApiException;

    if (error instanceof ApiException) {
      apiException = error;
    } else {
      // JavaScript Standard error wrapper fallback
      apiException = new SystemException(
        error.message || String(error),
        request.requestId,
        error.stack
      );
    }

    const metadata = {
      requestId: request.requestId,
      serverTimestamp: apiException.metadata.timestamp,
      processingTime: context.getElapsedTime(),
      version: request.version,
      // Diagnostics metadata
      exception: {
        category: apiException.category,
        code: apiException.code,
        internalMessage: apiException.internalMessage
      }
    };

    return ApiResponse.errorResponse(
      apiException.code,
      apiException.externalMessage, // Client receives ONLY the safe user-facing message
      apiException.status,
      metadata
    );
  }
}


// --- Source: src/core/exceptions/ExceptionMetadata.ts ---
interface ExceptionMetadata {
  readonly requestId: string;
  readonly timestamp: number;
  readonly exceptionType: string;
  readonly exceptionCode: string;
  readonly source: string;
  readonly details?: string;
}


// --- Source: src/core/exceptions/FeatureException.ts ---

class FeatureException extends ApiException {
  public readonly category = ExceptionCategory.FEATURE;
  public readonly code: string;
  public readonly status: number;

  constructor(codeOrMsg: string, internalMessageOrRequestId: string, requestIdOrDetails?: string) {
    let code: string;
    let internalMessage: string;
    let requestId: string;
    let status = 403;
    let externalMessage: string;

    if (codeOrMsg.startsWith('PM-')) {
      code = codeOrMsg;
      internalMessage = internalMessageOrRequestId;
      requestId = requestIdOrDetails || '';
      status = 403;
      externalMessage = internalMessage;
    } else {
      // Old style backward compatibility
      code = 'PM-FTR-001';
      internalMessage = codeOrMsg;
      requestId = internalMessageOrRequestId;
      status = 422;
      externalMessage = '指定された機能は現在無効化されています。';
    }

    super({
      internalMessage,
      externalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'FeatureException',
        exceptionCode: code,
        source: 'FEATURE_ACCESS_PIPELINE',
        details: requestIdOrDetails
      }
    });

    this.code = code;
    this.status = status;
  }
}


// --- Source: src/core/exceptions/LicenseException.ts ---

class LicenseException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code: string;
  public readonly status: number = 402; // Payment Required default (configured toggles can map it)

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'LicenseException',
        exceptionCode: code,
        source: 'LICENSING_PIPELINE'
      }
    });
    this.code = code;
  }
}


// --- Source: src/core/exceptions/PlatformException.ts ---

class PlatformException extends ApiException {
  public readonly category: ExceptionCategory = 'SYSTEM';
  public readonly code: string;
  public readonly status: number = 500;

  constructor(code: 'PM-PLT-001' | 'PM-PLT-002' | 'PM-PLT-003', internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'PlatformException',
        exceptionCode: code,
        source: 'PLATFORM_INTEGRATION_PIPELINE'
      }
    });
    this.code = code;
  }
}


// --- Source: src/core/exceptions/RoutingException.ts ---

class RoutingException extends ApiException {
  public readonly category = ExceptionCategory.ROUTING;
  public readonly code: string;
  public readonly status: number;

  constructor(
    code: 'PM-RTE-001' | 'PM-RTE-002',
    status: 404 | 405,
    internalMessage: string,
    requestId: string,
    details?: string
  ) {
    super({
      internalMessage,
      externalMessage:
        status === 404
          ? '指定された API ルートが見つかりません。'
          : '指定された HTTP メソッドは許可されていません。',
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'RoutingException',
        exceptionCode: code,
        source: 'ROUTING',
        details
      }
    });
    this.code = code;
    this.status = status;
  }

  public static notFound(internalMessage: string, requestId: string, details?: string): RoutingException {
    return new RoutingException('PM-RTE-001', 404, internalMessage, requestId, details);
  }

  public static methodNotAllowed(internalMessage: string, requestId: string, details?: string): RoutingException {
    return new RoutingException('PM-RTE-002', 405, internalMessage, requestId, details);
  }
}


// --- Source: src/core/exceptions/SubscriptionException.ts ---

class SubscriptionException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code: string;
  public readonly status: number = 403; // Forbidden

  constructor(code: string, internalMessage: string, requestId: string) {
    super({
      internalMessage,
      externalMessage: internalMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'SubscriptionException',
        exceptionCode: code,
        source: 'SUBSCRIPTION_GATE'
      }
    });
    this.code = code;
  }
}


// --- Source: src/core/exceptions/SystemException.ts ---

class SystemException extends ApiException {
  public readonly category = ExceptionCategory.SYSTEM;
  public readonly code = 'PM-SYS-001';
  public readonly status = 500;

  constructor(internalMessage: string, requestId: string, details?: string) {
    super({
      internalMessage,
      externalMessage: '予期しないシステムエラーが発生しました。',
      metadata: {
        requestId,
        timestamp: Date.now(),
        exceptionType: 'SystemException',
        exceptionCode: 'PM-SYS-001',
        source: 'SYSTEM',
        details
      }
    });
  }
}


// --- Source: src/core/api/APIEndpoint.ts ---
interface APIEndpoint {
  path: string;
  method: string;
  parameters: Record<string, any>[];
  requestBody: Record<string, any>;
  responseBody: Record<string, any>;
  responseSchemaVersion?: string;
  errorSchema?: Record<string, any>;
}


// --- Source: src/core/api/APISchema.ts ---

interface APISchema {
  id: string;
  name: string;
  type: APISchemaType;
  version: string;
  rawSchema: string;
}


// --- Source: src/core/api/APISchemaAnalyzerContext.ts ---
interface APISchemaAnalyzerContext {
  source: string;
  schemaId: string;
  runtimeId: string;
  analysisMode: string;
  timestamp: Date;
}


// --- Source: src/core/api/APISchemaAnalyzerEngine.ts ---

interface IAPISchemaAnalyzerEngine {
  analyze(schema: APISchema, context: APISchemaAnalyzerContext): Promise<boolean>;
  parse(rawSchema: string): Promise<APIEndpoint[]>;
  resolve(id: string): Promise<APISchema | null>;
  validate(schema: APISchema): Promise<boolean>;
}

abstract class BaseAPISchemaAnalyzerEngine implements IAPISchemaAnalyzerEngine {
  abstract analyze(schema: APISchema, context: APISchemaAnalyzerContext): Promise<boolean>;
  abstract parse(rawSchema: string): Promise<APIEndpoint[]>;
  abstract resolve(id: string): Promise<APISchema | null>;
  abstract validate(schema: APISchema): Promise<boolean>;
}


// --- Source: src/core/api/APISchemaAnalyzerManager.ts ---

class APISchemaAnalyzerManager {
  private active: boolean = false;

  public async initialize(): Promise<boolean> {
    this.active = true;
    return true;
  }

  public async analyze(schema: APISchema, context: APISchemaAnalyzerContext): Promise<boolean> {
    return true;
  }

  public async status(): Promise<{ active: boolean; status: string }> {
    return {
      active: this.active,
      status: this.active ? "active" : "inactive"
    };
  }

  public async shutdown(): Promise<boolean> {
    this.active = false;
    return true;
  }
}


// --- Source: src/core/api/APISchemaMapper.ts ---

class APISchemaMapper {
  public async mapEndpoints(schema: APISchema): Promise<APIEndpoint[]> {
    return [];
  }

  public async mapTypes(schema: APISchema): Promise<Record<string, any>> {
    return {};
  }

  public async buildGraph(endpoints: APIEndpoint[]): Promise<Record<string, any>> {
    return {};
  }
}


// --- Source: src/core/api/APISchemaRegistry.ts ---

class APISchemaRegistry {
  private registry: Map<string, APISchema> = new Map();

  public async addSchema(schema: APISchema): Promise<boolean> {
    if (this.registry.has(schema.id)) {
      return false;
    }
    this.registry.set(schema.id, schema);
    return true;
  }

  public async findSchema(id: string): Promise<APISchema | null> {
    return this.registry.get(id) || null;
  }

  public async listSchemas(): Promise<APISchema[]> {
    return Array.from(this.registry.values());
  }

  public async removeSchema(id: string): Promise<boolean> {
    return this.registry.delete(id);
  }
}


// --- Source: src/core/api/APISchemaType.ts ---
enum APISchemaType {
  OPENAPI = "OPENAPI",
  GRAPHQL = "GRAPHQL",
  REST = "REST",
  INTERNAL = "INTERNAL",
  MOCK = "MOCK"
}


// --- Source: src/core/api/ApiRequest.ts ---
class ApiRequest {
  public readonly method: string;
  public readonly path: string;
  public readonly version: string;
  public readonly query: Record<string, any>;
  public readonly body: Record<string, any>;
  public readonly headers: Record<string, any>;
  public readonly requestId: string;
  public readonly pathParams: Record<string, string>;

  constructor(params: {
    method: string;
    path: string;
    version: string;
    query?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, any>;
    requestId: string;
    pathParams?: Record<string, string>;
  }) {
    this.method = params.method.toUpperCase();
    this.path = params.path;
    this.version = params.version.toLowerCase();
    this.query = params.query || {};
    this.body = params.body || {};
    this.headers = params.headers || {};
    this.requestId = params.requestId;
    this.pathParams = params.pathParams || {};
  }
}


// --- Source: src/core/api/ApiResponse.ts ---
class ApiResponse {
  public readonly status: number;
  public readonly success: boolean;
  public readonly data: any;
  public readonly error: { code: string; message: string } | null;
  public readonly metadata: {
    requestId: string;
    serverTimestamp: number;
    processingTime: number;
    version: string;
  };

  constructor(params: {
    status: number;
    success: boolean;
    data?: any;
    error?: { code: string; message: string } | null;
    metadata: {
      requestId: string;
      serverTimestamp: number;
      processingTime: number;
      version: string;
    };
  }) {
    this.status = params.status;
    this.success = params.success;
    this.data = params.data || null;
    this.error = params.error || null;
    this.metadata = params.metadata;
  }

  public static successResponse(data: any, status: number, metadata: any): ApiResponse {
    return new ApiResponse({
      status,
      success: true,
      data,
      metadata
    });
  }

  public static errorResponse(code: string, message: string, status: number, metadata: any): ApiResponse {
    return new ApiResponse({
      status,
      success: false,
      error: { code, message },
      metadata
    });
  }
}


// --- Source: src/core/api/ApiRouter.ts ---

class ApiRouter {
  private static instance: ApiRouter | null = null;
  private registry: EndpointRegistry;

  private constructor() {
    this.registry = EndpointRegistry.getInstance();
  }

  public static getInstance(): ApiRouter {
    if (!ApiRouter.instance) {
      ApiRouter.instance = new ApiRouter();
    }
    return ApiRouter.instance;
  }

  public async route(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };

    // 1. HTTP Method validation
    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ApiResponse.errorResponse(
        'METHOD_NOT_ALLOWED',
        `HTTP Method ${request.method} is not allowed by RoutePolicy.`,
        405,
        metadata
      );
    }

    try {
      // 2. Resolve handler
      const handler = this.registry.getHandler(request.method, request.version, request.path, request);
      
      // 3. Execute handler
      return await handler.execute(request, context);
    } catch (err: any) {
      return ApiResponse.errorResponse(
        'INTERNAL_SERVER_ERROR',
        err.message || String(err),
        500,
        metadata
      );
    }
  }
}


// --- Source: src/core/api/ApiVersionResolver.ts ---

class ApiVersionResolver {
  private static readonly SUPPORTED_VERSIONS: Set<string> = new Set(['v1', 'v2', 'v3', 'future']);

  public static resolve(pathVersion?: string, queryVersion?: string): string {
    // 優先度 1: パスで指定されたバージョン (例: /v2/dashboard)
    if (pathVersion && ApiVersionResolver.SUPPORTED_VERSIONS.has(pathVersion.toLowerCase())) {
      return pathVersion.toLowerCase();
    }

    // 優先度 2: クエリ/ボディパラメータで指定されたバージョン (例: ?version=2)
    if (queryVersion) {
      const normalized = queryVersion.startsWith('v') ? queryVersion.toLowerCase() : `v${queryVersion}`;
      if (ApiVersionResolver.SUPPORTED_VERSIONS.has(normalized)) {
        return normalized;
      }
    }

    // デフォルト: GasConfigurationProvider の API バージョン
    const defaultVersion = GasConfigurationProvider.getInstance().getApiVersion();
    const resolvedDefault = defaultVersion.split('-')[0].split('.')[0]; // 例: "1.0.0-RC1" -> "v1"
    const finalDefault = resolvedDefault.startsWith('v') ? resolvedDefault.toLowerCase() : `v${resolvedDefault}`;
    return ApiVersionResolver.SUPPORTED_VERSIONS.has(finalDefault) ? finalDefault : 'v2';
  }
}


// --- Source: src/core/api/EndpointRegistry.ts ---

class EndpointRegistry {
  private static instance: EndpointRegistry | null = null;
  private readonly routes: Map<string, EndpointHandler> = new Map();
  private readonly patternRoutes: Array<{
    method: string;
    version: string;
    pattern: string;
    regex: RegExp;
    paramNames: string[];
    handler: EndpointHandler;
  }> = [];
  private readonly unknownHandler: EndpointHandler;

  private constructor() {
    this.unknownHandler = new UnknownEndpointHandler();
    this.registerDefaultRoutes();
  }

  public static getInstance(): EndpointRegistry {
    if (!EndpointRegistry.instance) {
      EndpointRegistry.instance = new EndpointRegistry();
    }
    return EndpointRegistry.instance;
  }

  private registerDefaultRoutes(): void {
    const dashboard = new DashboardHandler();
    const holding = new HoldingHandler();
    const health = new HealthHandler();
    const version = new VersionHandler();

    // v2 default routes (Standard specification)
    this.register('GET', 'v2', '/dashboard', dashboard);
    this.register('POST', 'v2', '/dashboard', dashboard);
    this.register('GET', 'v2', '/holding', holding);
    this.register('POST', 'v2', '/holding', holding);
    this.register('GET', 'v2', '/health', health);
    this.register('GET', 'v2', '/version', version);
  }

  public register(method: string, version: string, path: string, handler: EndpointHandler): void {
    const key = RouteResolver.resolveKey(method, version, path);
    this.routes.set(key, handler);

    // Dynamic pattern registration
    if (path.includes('{')) {
      const paramNames: string[] = [];
      let regexStr = path.replace(/{([^}]+)}/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });

      if (!regexStr.startsWith('/')) {
        regexStr = '/' + regexStr;
      }
      if (regexStr.endsWith('/') && regexStr.length > 1) {
        regexStr = regexStr.slice(0, -1);
      }

      const regex = new RegExp(`^${regexStr}$`, 'i');
      this.patternRoutes.push({
        method: method.toUpperCase(),
        version: version.toLowerCase(),
        pattern: path,
        regex,
        paramNames,
        handler
      });
    }
  }

  public getHandler(method: string, version: string, path: string, request?: ApiRequest): EndpointHandler {
    // 1. Exact Match
    const key = RouteResolver.resolveKey(method, version, path);
    const exactHandler = this.routes.get(key);
    if (exactHandler) {
      return exactHandler;
    }

    // 2. Pattern Match
    let normPath = path.trim();
    if (!normPath.startsWith('/')) {
      normPath = '/' + normPath;
    }
    if (normPath.endsWith('/') && normPath.length > 1) {
      normPath = normPath.slice(0, -1);
    }

    for (const pr of this.patternRoutes) {
      if (pr.method === method.toUpperCase() && pr.version === version.toLowerCase()) {
        const match = normPath.match(pr.regex);
        if (match) {
          if (request) {
            pr.paramNames.forEach((name, index) => {
              const val = match[index + 1];
              (request.pathParams as any)[name] = decodeURIComponent(val);
            });
          }
          return pr.handler;
        }
      }
    }

    // 3. Legacy Fallback
    return this.unknownHandler;
  }
}


// --- Source: src/core/api/RoutePolicy.ts ---
class RoutePolicy {
  private static readonly ALLOWED_METHODS: Set<string> = new Set(['GET', 'POST', 'PUT', 'DELETE']);

  public static isMethodAllowed(method: string): boolean {
    return RoutePolicy.ALLOWED_METHODS.has(method.toUpperCase());
  }
}


// --- Source: src/core/api/RouteResolver.ts ---
class RouteKey {
  private readonly key: string;

  constructor(method: string, version: string, path: string) {
    // パスから末尾・先頭のスラッシュ等を正規化 (例: "dashboard" -> "/dashboard")
    let normalizedPath = path.trim().toLowerCase();
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
      normalizedPath = normalizedPath.slice(0, -1);
    }

    this.key = `${method.toUpperCase()}:${version.toLowerCase()}:${normalizedPath}`;
  }

  public toString(): string {
    return this.key;
  }
}

class RouteResolver {
  public static resolveKey(method: string, version: string, path: string): string {
    return new RouteKey(method, version, path).toString();
  }
}


// --- Source: src/core/api/handlers/DashboardHandler.ts ---

class DashboardHandler implements EndpointHandler {
  public execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'DashboardHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}


// --- Source: src/core/api/handlers/EndpointHandler.ts ---

interface EndpointHandler {
  execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse | Promise<ApiResponse>;
}


// --- Source: src/core/api/handlers/HealthHandler.ts ---

class HealthHandler implements EndpointHandler {
  public execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'HealthHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}


// --- Source: src/core/api/handlers/HoldingHandler.ts ---

class HoldingHandler implements EndpointHandler {
  public execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'HoldingHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}


// --- Source: src/core/api/handlers/UnknownEndpointHandler.ts ---

class UnknownEndpointHandler implements EndpointHandler {
  public execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };

    if (!RoutePolicy.isMethodAllowed(request.method)) {
      return ApiResponse.errorResponse(
        'METHOD_NOT_ALLOWED',
        `HTTP Method ${request.method} is not allowed.`,
        405,
        metadata
      );
    }

    return ApiResponse.errorResponse(
      'ROUTE_NOT_FOUND',
      `API Route "${request.method} ${request.path}" under version ${request.version} was not found.`,
      404,
      metadata
    );
  }
}


// --- Source: src/core/api/handlers/VersionHandler.ts ---

class VersionHandler implements EndpointHandler {
  public execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.errorResponse(
      'NOT_IMPLEMENTED',
      'VersionHandler is currently a placeholder stub in S3-2 Routing Foundation.',
      501,
      metadata
    );
  }
}


