// =========================================
// Generated: active/gas/00_core.gs
// =========================================

// --- Source: src/plugins/posting-map/core/exceptions/ApiException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/AuthenticationException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/AuthorizationException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/BridgeException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/ConfigurationException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/ExceptionCategory.ts ---
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


// --- Source: src/plugins/posting-map/core/exceptions/ExceptionHandler.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/ExceptionMapper.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/ExceptionMetadata.ts ---
interface ExceptionMetadata {
  readonly requestId: string;
  readonly timestamp: number;
  readonly exceptionType: string;
  readonly exceptionCode: string;
  readonly source: string;
  readonly details?: string;
}


// --- Source: src/plugins/posting-map/core/exceptions/FeatureException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/LicenseException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/PlatformException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/RoutingException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/SubscriptionException.ts ---

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


// --- Source: src/plugins/posting-map/core/exceptions/SystemException.ts ---

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


// --- Source: src/plugins/posting-map/core/api/APIEndpoint.ts ---
interface APIEndpoint {
  path: string;
  method: string;
  parameters: Record<string, any>[];
  requestBody: Record<string, any>;
  responseBody: Record<string, any>;
  responseSchemaVersion?: string;
  errorSchema?: Record<string, any>;
}


// --- Source: src/plugins/posting-map/core/api/APISchema.ts ---

interface APISchema {
  id: string;
  name: string;
  type: APISchemaType;
  version: string;
  rawSchema: string;
}


// --- Source: src/plugins/posting-map/core/api/APISchemaAnalyzerContext.ts ---
interface APISchemaAnalyzerContext {
  source: string;
  schemaId: string;
  runtimeId: string;
  analysisMode: string;
  timestamp: Date;
}


// --- Source: src/plugins/posting-map/core/api/APISchemaAnalyzerEngine.ts ---

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


// --- Source: src/plugins/posting-map/core/api/APISchemaAnalyzerManager.ts ---

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


// --- Source: src/plugins/posting-map/core/api/APISchemaMapper.ts ---

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


// --- Source: src/plugins/posting-map/core/api/APISchemaRegistry.ts ---

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


// --- Source: src/plugins/posting-map/core/api/APISchemaType.ts ---
enum APISchemaType {
  OPENAPI = "OPENAPI",
  GRAPHQL = "GRAPHQL",
  REST = "REST",
  INTERNAL = "INTERNAL",
  MOCK = "MOCK"
}


// --- Source: src/plugins/posting-map/core/api/ApiRequest.ts ---
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


// --- Source: src/plugins/posting-map/core/api/ApiResponse.ts ---
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


// --- Source: src/plugins/posting-map/core/api/ApiRouter.ts ---

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


// --- Source: src/plugins/posting-map/core/api/ApiVersionResolver.ts ---

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


// --- Source: src/plugins/posting-map/core/api/EndpointRegistry.ts ---

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


// --- Source: src/plugins/posting-map/core/api/RoutePolicy.ts ---
class RoutePolicy {
  private static readonly ALLOWED_METHODS: Set<string> = new Set(['GET', 'POST', 'PUT', 'DELETE']);

  public static isMethodAllowed(method: string): boolean {
    return RoutePolicy.ALLOWED_METHODS.has(method.toUpperCase());
  }
}


// --- Source: src/plugins/posting-map/core/api/RouteResolver.ts ---
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


// --- Source: src/plugins/posting-map/core/api/handlers/DashboardHandler.ts ---

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


// --- Source: src/plugins/posting-map/core/api/handlers/EndpointHandler.ts ---

interface EndpointHandler {
  execute(request: ApiRequest, context: ApiExecutionContext): ApiResponse | Promise<ApiResponse>;
}


// --- Source: src/plugins/posting-map/core/api/handlers/HealthHandler.ts ---

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


// --- Source: src/plugins/posting-map/core/api/handlers/HoldingHandler.ts ---

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


// --- Source: src/plugins/posting-map/core/api/handlers/UnknownEndpointHandler.ts ---

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


// --- Source: src/plugins/posting-map/core/api/handlers/VersionHandler.ts ---

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


// --- Source: src/plugins/posting-map/core/performance/governance/PerformanceGovernanceDecision.ts ---
type PerformanceGovernanceStatus = 'PASS' | 'WARNING' | 'FAILED';

enum PerformanceGovernanceAction {
  PROCEED = 'PROCEED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  BLOCK = 'BLOCK'
}

interface PerformanceGovernanceDecision {
  status: PerformanceGovernanceStatus;
  score: number;
  action: PerformanceGovernanceAction;
  recommendation: string;
  generatedAt: string;
}


// --- Source: src/plugins/posting-map/core/performance/governance/PerformanceGovernanceEngine.ts ---

class PerformanceGovernanceEngine {
  private policy: PerformanceGovernancePolicy;

  constructor() {
    this.policy = new PerformanceGovernancePolicy();
  }

  public evaluate(validationResult: PerformanceValidationResult): PerformanceGovernanceResult {
    const decision = this.policy.evaluate(validationResult.summary);

    return {
      metadata: validationResult.metadata,
      decision,
      validationResult
    };
  }
}


// --- Source: src/plugins/posting-map/core/performance/governance/PerformanceGovernanceExporter.ts ---

class PerformanceGovernanceExporter {
  public exportToJson(result: PerformanceGovernanceResult, outputPath: string): void {
    const jsonString = JSON.stringify(result, null, 2);
    fs.writeFileSync(outputPath, jsonString, 'utf-8');
    console.log(`[Governance Exporter] JSON report written to: ${outputPath}`);
  }

  public exportToConsole(result: PerformanceGovernanceResult): void {
    const { decision, validationResult } = result;
    const { summary, report } = validationResult;

    // Build the report format
    const governanceReport: PerformanceGovernanceReport = {
      overallStatus: decision.status,
      action: decision.action,
      score: decision.score,
      recommendation: decision.recommendation,
      violations: report.violations,
      generatedAt: decision.generatedAt
    };

    console.log('\n==================================================');
    console.log('       PERFORMANCE GOVERNANCE DECISION');
    console.log('==================================================');
    console.log(`STATUS         : ${governanceReport.overallStatus}`);
    console.log(`ACTION         : ${governanceReport.action}`);
    console.log(`SCORE          : ${governanceReport.score} / 100`);
    console.log(`RECOMMENDATION : ${governanceReport.recommendation}`);
    console.log(`GENERATED AT   : ${governanceReport.generatedAt}`);
    console.log('--------------------------------------------------');
    console.log(`[Validation Stats] PASS: ${summary.passed} | INFO: ${summary.info} | WARNING: ${summary.warning} | FAILED: ${summary.failed}`);
    console.log('==================================================\n');

    if (governanceReport.violations && governanceReport.violations.length > 0) {
      console.log('Violations:');
      governanceReport.violations.forEach(v => {
        console.log(`  [${v.status}] ${v.ruleId} (${v.ruleName})`);
        console.log(`    File   : ${v.targetFile}`);
        console.log(`    Message: ${v.message}`);
        console.log('');
      });
      console.log('==================================================\n');
    }
  }
}


// --- Source: src/plugins/posting-map/core/performance/governance/PerformanceGovernancePolicy.ts ---

class PerformanceGovernancePolicy {
  public static readonly PASS_SCORE = 90;
  public static readonly WARNING_SCORE = 70;
  public static readonly MAX_WARNING = 3;

  public evaluate(summary: PerformanceValidationSummary): PerformanceGovernanceDecision {
    let status: PerformanceGovernanceStatus;
    let action: PerformanceGovernanceAction;
    let recommendation: string;

    const { failed, warning, score } = summary;

    // FAILED: Any failures, or score below WARNING_SCORE
    if (failed > 0 || score < PerformanceGovernancePolicy.WARNING_SCORE) {
      status = 'FAILED';
      action = PerformanceGovernanceAction.BLOCK;
      recommendation = 'Performance violations must be resolved before release.';
    } 
    // WARNING: No failures, but too many warnings or score is between WARNING_SCORE and PASS_SCORE
    else if (warning > PerformanceGovernancePolicy.MAX_WARNING || score < PerformanceGovernancePolicy.PASS_SCORE) {
      status = 'WARNING';
      action = PerformanceGovernanceAction.REVIEW_REQUIRED;
      recommendation = 'Performance improvements recommended.';
    } 
    // PASS: No failures, warnings within limit, and score >= PASS_SCORE
    else {
      status = 'PASS';
      action = PerformanceGovernanceAction.PROCEED;
      recommendation = 'No action required.';
    }

    return {
      status,
      score,
      action,
      recommendation,
      generatedAt: new Date().toISOString()
    };
  }
}


// --- Source: src/plugins/posting-map/core/performance/governance/PerformanceGovernanceReport.ts ---

interface PerformanceGovernanceReport {
  overallStatus: PerformanceGovernanceStatus;
  action: PerformanceGovernanceAction;
  score: number;
  recommendation: string;
  violations: PerformancePolicyResult[];
  generatedAt: string;
}


// --- Source: src/plugins/posting-map/core/performance/governance/PerformanceGovernanceResult.ts ---

interface PerformanceGovernanceResult {
  metadata: PerformanceValidationMetadata;
  decision: PerformanceGovernanceDecision;
  validationResult: PerformanceValidationResult;
}


// --- Source: src/plugins/posting-map/core/performance/validation/PerformanceValidationExporter.ts ---

class PerformanceValidationExporter {
  public exportToJson(result: PerformanceValidationResult, outputPath: string): void {
    const jsonString = JSON.stringify(result, null, 2);
    fs.writeFileSync(outputPath, jsonString, 'utf-8');
    console.log(`[Validation Exporter] JSON report written to: ${outputPath}`);
  }

  public exportToConsole(result: PerformanceValidationResult): void {
    const summary = result.summary;
    console.log('\n==================================================');
    console.log('       PERFORMANCE VALIDATION REPORT');
    console.log('==================================================');
    console.log(`Status        : ${summary.status}`);
    console.log(`Score         : ${summary.score} / 100`);
    console.log(`Policies      : ${summary.validationCount}`);
    console.log(`Duration      : ${summary.durationMs} ms`);
    console.log(`Generated At  : ${summary.generatedAt}`);
    console.log('--------------------------------------------------');
    console.log(`PASS: ${summary.passed} | INFO: ${summary.info} | WARNING: ${summary.warning} | FAILED: ${summary.failed}`);
    console.log('==================================================\n');

    if (result.report.violations && result.report.violations.length > 0) {
      console.log('Violations:');
      result.report.violations.forEach(v => {
        console.log(`  [${v.status}] ${v.ruleId} (${v.ruleName})`);
        console.log(`    File   : ${v.targetFile}`);
        console.log(`    Message: ${v.message}`);
        console.log('');
      });
      console.log('==================================================\n');
    }
  }
}


// --- Source: src/plugins/posting-map/core/performance/validation/PerformanceValidationResult.ts ---

interface PerformanceValidationMetadata {
  toolVersion: string;
  schemaVersion: string;
  runtime: string;
  generatedAt: string;
}

interface PerformanceValidationResult {
  metadata: PerformanceValidationMetadata;
  summary: PerformanceValidationSummary;
  metrics?: RepositoryPerformanceMetrics;
  report: PerformancePolicyReport;
}


// --- Source: src/plugins/posting-map/core/performance/validation/PerformanceValidationRunner.ts ---

class PerformanceValidationRunner {
  private engine: PerformancePolicyEngine;

  constructor() {
    this.engine = new PerformancePolicyEngine();
  }

  /**
   * Run the validation process for the given source directory.
   */
  public run(sourceDirectory: string): PerformanceValidationResult {
    const startTime = Date.now();
    const generatedAt = new Date().toISOString();

    // 1. Gather contexts
    const contexts = this.gatherContexts(sourceDirectory);

    // 2. Try to get metrics from profiler (if executed in a runtime flow, otherwise it might be 0)
    let metrics: RepositoryPerformanceMetrics | undefined = undefined;
    try {
      const profiler = RepositoryPerformanceProfiler.getInstance();
      metrics = profiler.getMetrics();
      // Only include metrics if there is some activity
      if (metrics.totalExecutionTimeMs === 0 && metrics.repositoryCallCount === 0) {
        metrics = undefined;
      }
    } catch (e) {
      metrics = undefined; // Profiler not initialized or error
    }

    // Attach metrics to contexts if available (Policy can use them)
    if (metrics) {
      for (const ctx of contexts) {
        ctx.metrics = metrics;
      }
    }

    // 3. Execute Engine
    const report = this.engine.validate(contexts);

    // 4. Generate Summary
    const durationMs = Date.now() - startTime;
    let status: PerformanceValidationStatus = 'PASS';
    if (report.failed > 0) {
      status = 'FAILED';
    } else if (report.warning > 0) {
      status = 'WARNING';
    }

    const summary: PerformanceValidationSummary = {
      status,
      validationCount: report.policyCount,
      passed: report.pass,
      warning: report.warning,
      failed: report.failed,
      info: report.info,
      score: report.score,
      durationMs,
      generatedAt
    };

    // 5. Generate Metadata
    const metadata: PerformanceValidationMetadata = {
      toolVersion: '1.0.0',
      schemaVersion: 'v1',
      runtime: 'Node.js',
      generatedAt
    };

    // 6. Return Result
    return {
      metadata,
      summary,
      metrics,
      report
    };
  }

  private gatherContexts(dir: string): PolicyContext[] {
    const contexts: PolicyContext[] = [];
    const walkDir = (currentDir: string) => {
      if (!fs.existsSync(currentDir)) return;
      const files = fs.readdirSync(currentDir);
      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.includes('.test.ts')) {
          const sourceCode = fs.readFileSync(fullPath, 'utf8');
          contexts.push({ filePath: fullPath, sourceCode });
        }
      }
    };
    walkDir(dir);
    return contexts;
  }
}


// --- Source: src/plugins/posting-map/core/performance/validation/PerformanceValidationSummary.ts ---
type PerformanceValidationStatus = 'PASS' | 'WARNING' | 'FAILED';

interface PerformanceValidationSummary {
  status: PerformanceValidationStatus;
  validationCount: number;
  passed: number;
  warning: number;
  failed: number;
  info: number;
  score: number;
  durationMs: number;
  generatedAt: string;
}


// --- Source: src/plugins/posting-map/core/performance/policy/PerformancePolicy.ts ---

interface PolicyContext {
  sourceCode: string;
  filePath: string;
  metrics?: RepositoryPerformanceMetrics;
}

interface IPerformancePolicy {
  get id(): string;
  get name(): string;
  
  validate(context: PolicyContext): PerformancePolicyResult[];
}


// --- Source: src/plugins/posting-map/core/performance/policy/PerformancePolicyEngine.ts ---

class PerformancePolicyEngine {
  private registry: PerformancePolicyRegistry;

  constructor() {
    this.registry = PerformancePolicyRegistry.getInstance();
  }

  public validate(contexts: PolicyContext[]): PerformancePolicyReport {
    const policies = this.registry.getPolicies();
    let allResults: PerformancePolicyResult[] = [];

    for (const policy of policies) {
      for (const context of contexts) {
        const results = policy.validate(context);
        allResults = allResults.concat(results);
      }
    }

    return this.generateReport(policies.length, allResults);
  }

  private generateReport(policyCount: number, results: PerformancePolicyResult[]): PerformancePolicyReport {
    let pass = 0;
    let warning = 0;
    let failed = 0;
    let info = 0;

    const violations: PerformancePolicyResult[] = [];

    for (const res of results) {
      switch (res.status) {
        case 'PASS':
          pass++;
          break;
        case 'WARNING':
          warning++;
          violations.push(res);
          break;
        case 'FAILED':
          failed++;
          violations.push(res);
          break;
        case 'INFO':
          info++;
          violations.push(res);
          break;
      }
    }

    // Default perfect score is 100.
    // Deduct 10 points for each FAILED, 3 points for each WARNING.
    // Minimum score is 0.
    let score = 100 - (failed * 10) - (warning * 3);
    if (score < 0) score = 0;

    return {
      policyCount,
      score,
      pass,
      warning,
      failed,
      info,
      violations
    };
  }

}


// --- Source: src/plugins/posting-map/core/performance/policy/PerformancePolicyRegistry.ts ---

class PerformancePolicyRegistry {
  private static instance: PerformancePolicyRegistry;
  private policies: IPerformancePolicy[] = [];

  private constructor() {}

  public static getInstance(): PerformancePolicyRegistry {
    if (!PerformancePolicyRegistry.instance) {
      PerformancePolicyRegistry.instance = new PerformancePolicyRegistry();
    }
    return PerformancePolicyRegistry.instance;
  }

  public register(policy: IPerformancePolicy): void {
    if (!this.policies.some(p => p.id === policy.id)) {
      this.policies.push(policy);
    }
  }

  public clear(): void {
    this.policies = [];
  }

  public getPolicies(): IPerformancePolicy[] {
    return [...this.policies];
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/PerformancePolicyReport.ts ---

interface PerformancePolicyReport {
  policyCount: number;
  score: number;
  pass: number;
  warning: number;
  failed: number;
  info: number;
  violations: PerformancePolicyResult[];
}


// --- Source: src/plugins/posting-map/core/performance/policy/PerformancePolicyResult.ts ---
type PolicyStatus = 'PASS' | 'WARNING' | 'FAILED' | 'INFO';

interface PerformancePolicyResult {
  ruleId: string;
  ruleName: string;
  status: PolicyStatus;
  message: string;
  targetFile?: string;
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule001NoLoopRead.ts ---

class Rule001NoLoopRead implements IPerformancePolicy {
  public get id(): string { return 'RULE-001'; }
  public get name(): string { return 'No Loop Read'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Very basic static check using regex
    // Looks for `for ` or `while ` followed eventually by `.readAll` or `.readRange` within a rough block.
    // This is a naive check since AST is not allowed for now.
    const loopRegex = /(for\s*\(|while\s*\()[\s\S]{0,200}?\.(readAll|readRange)\s*\(/;

    if (loopRegex.test(context.sourceCode)) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'Spreadsheet read operation (readAll/readRange) detected inside a loop. This causes severe performance degradation.',
        targetFile: context.filePath
      });
    }

    return results;
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule002NoLoopWrite.ts ---

class Rule002NoLoopWrite implements IPerformancePolicy {
  public get id(): string { return 'RULE-002'; }
  public get name(): string { return 'No Loop Write'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    const loopRegex = /(for\s*\(|while\s*\()[\s\S]{0,300}?\.(updateRange|appendRows|setValue|setValues)\s*\(/;

    if (loopRegex.test(context.sourceCode)) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'Spreadsheet write operation (updateRange/appendRows) detected inside a loop. Consolidate data into arrays and write once.',
        targetFile: context.filePath
      });
    }

    return results;
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule003RepositoryIsolation.ts ---

class Rule003RepositoryIsolation implements IPerformancePolicy {
  public get id(): string { return 'RULE-003'; }
  public get name(): string { return 'Repository Isolation'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Check if non-repository code is trying to import SpreadsheetReader/Writer
    const isRepositoryFolder = context.filePath.includes('/repository/');
    const isInfrastructureFolder = context.filePath.includes('/infrastructure/');
    
    if (!isRepositoryFolder && !isInfrastructureFolder) {
      if (context.sourceCode.includes('SpreadsheetReader') || context.sourceCode.includes('SpreadsheetWriter')) {
        results.push({
          ruleId: this.id,
          ruleName: this.name,
          status: 'FAILED',
          message: 'SpreadsheetReader/Writer must only be used within the Repository or Infrastructure layer.',
          targetFile: context.filePath
        });
      }
    }

    return results;
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule004ApplicationSpreadsheetBan.ts ---

class Rule004ApplicationSpreadsheetBan implements IPerformancePolicy {
  public get id(): string { return 'RULE-004'; }
  public get name(): string { return 'Application Spreadsheet Ban'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Check if Application layer files directly access SpreadsheetApp
    const isApplicationFolder = context.filePath.includes('/application/');
    
    if (isApplicationFolder) {
      if (context.sourceCode.includes('SpreadsheetApp.') || context.sourceCode.includes('SpreadsheetApp(')) {
        results.push({
          ruleId: this.id,
          ruleName: this.name,
          status: 'FAILED',
          message: 'Direct usage of SpreadsheetApp is prohibited in the Application layer. Use Repository interfaces.',
          targetFile: context.filePath
        });
      }
    }

    return results;
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule005SpreadsheetAccess.ts ---

class Rule005SpreadsheetAccess implements IPerformancePolicy {
  public get id(): string { return 'RULE-005'; }
  public get name(): string { return 'Spreadsheet Access Restrict'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Check if Spreadsheet is being used without going through SpreadsheetReader/Writer or Repository
    const isGasOrSpreadsheet = context.sourceCode.includes('SpreadsheetApp.');
    const isInfrastructure = context.filePath.includes('/infrastructure/');
    
    if (isGasOrSpreadsheet && !isInfrastructure) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'Spreadsheet usage must be encapsulated within the Infrastructure/Repository layer.',
        targetFile: context.filePath
      });
    }

    return results;
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule006MemoryProcessing.ts ---

class Rule006MemoryProcessing implements IPerformancePolicy {
  public get id(): string { return 'RULE-006'; }
  public get name(): string { return 'Memory Processing Required'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // If it's a Repository and it reads data, we expect to see Map, array functions, etc.
    const isRepository = context.filePath.includes('/repository/') && context.filePath.endsWith('Repository.ts');
    
    if (isRepository && context.sourceCode.includes('readAll(')) {
      const hasMemoryProcessing = context.sourceCode.includes('new Map') || 
                                  context.sourceCode.includes('.filter(') ||
                                  context.sourceCode.includes('.find(') ||
                                  context.sourceCode.includes('.reduce(');
                                  
      if (!hasMemoryProcessing) {
        results.push({
          ruleId: this.id,
          ruleName: this.name,
          status: 'WARNING',
          message: 'Repository uses readAll but lacks standard memory processing patterns (Map/filter/reduce). Ensure operations are done in-memory.',
          targetFile: context.filePath
        });
      }
      
      if (context.metrics && context.metrics.totalExecutionTimeMs > 0) {
          const reads = context.metrics.sheetMetrics.reduce((acc, m) => acc + m.readCount, 0);
          if (reads > 10) {
              results.push({
                ruleId: this.id,
                ruleName: this.name,
                status: 'INFO',
                message: `Repository performed ${reads} spreadsheet reads during this context. Optimization candidate for data consolidation.`,
                targetFile: context.filePath
              });
          }
      }
    }

    return results;
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule007RepositoryApiConsistency.ts ---

class Rule007RepositoryApiConsistency implements IPerformancePolicy {
  public get id(): string { return 'RULE-007'; }
  public get name(): string { return 'Repository API Consistency'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Only check repository classes
    if (!context.filePath.includes('/repository/') || !context.filePath.endsWith('Repository.ts')) {
      return results;
    }

    // Attempt to find implements I...Repository
    const implementsMatch = context.sourceCode.match(/implements\s+(I[A-Za-z0-9]+Repository)/);
    if (!implementsMatch) {
      return results;
    }

    const interfaceName = implementsMatch[1];
    
    // Fallback naive search for the interface file in the same directory or common domain dirs
    // Since AST is disabled, this is a basic string matching mechanism.
    const searchDirs = [
      path.dirname(context.filePath),
      path.join(path.dirname(context.filePath), '../../domain') // Rough guess for domain interfaces
    ];
    
    let interfaceContent = '';
    
    // Extract public methods from the current class
    // Naive regex: public methodName(
    const publicMethodRegex = /public\s+([a-zA-Z0-9_]+)\s*\(/g;
    let match;
    const publicMethods: string[] = [];
    while ((match = publicMethodRegex.exec(context.sourceCode)) !== null) {
      publicMethods.push(match[1]);
    }

    // Since reading interface file precisely without AST is hard, we will yield INFO 
    // or WARNING if we detect public methods that are typically not in generic repos
    // Alternatively, if we know common repo methods: findById, findAll, save, getNextStaffNo, etc.
    // For now, we will just log an INFO to verify repository interface consistency.
    results.push({
      ruleId: this.id,
      ruleName: this.name,
      status: 'INFO',
      message: `Repository exposes public methods: ${publicMethods.join(', ')}. Ensure all are defined in ${interfaceName}.`,
      targetFile: context.filePath
    });

    return results;
  }
}


// --- Source: src/plugins/posting-map/core/performance/policy/rules/Rule008ProfilerMandatory.ts ---

class Rule008ProfilerMandatory implements IPerformancePolicy {
  public get id(): string { return 'RULE-008'; }
  public get name(): string { return 'Profiler Mandatory'; }

  public validate(context: PolicyContext): PerformancePolicyResult[] {
    const results: PerformancePolicyResult[] = [];
    
    // Only check SpreadsheetRepository implementations
    if (!context.filePath.includes('/repository/') || !context.filePath.includes('Spreadsheet') || !context.filePath.endsWith('Repository.ts')) {
      return results;
    }

    const hasProfilerImport = context.sourceCode.includes('RepositoryPerformanceProfiler');
    const usesProfiler = context.sourceCode.includes('.incrementRepositoryCall(') || context.sourceCode.includes('.recordExecutionTime(');

    if (!hasProfilerImport || !usesProfiler) {
      results.push({
        ruleId: this.id,
        ruleName: this.name,
        status: 'FAILED',
        message: 'SpreadsheetRepository must use RepositoryPerformanceProfiler to record metrics.',
        targetFile: context.filePath
      });
    } else {
        results.push({
            ruleId: this.id,
            ruleName: this.name,
            status: 'PASS',
            message: 'Profiler is correctly utilized in this repository.',
            targetFile: context.filePath
        });
    }

    return results;
  }
}


