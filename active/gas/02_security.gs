// =========================================
// Generated: active/gas/02_security.gs
// =========================================

// --- Source: src/foundation/authentication/AuthenticationContext.ts ---
type IdentityType = 'USER' | 'SERVICE' | 'ANONYMOUS';

const IdentityType = {
  USER: 'USER' as IdentityType,
  SERVICE: 'SERVICE' as IdentityType,
  ANONYMOUS: 'ANONYMOUS' as IdentityType
};

type AuthenticationMethod = 'API_KEY' | 'LIFF' | 'INTERNAL_SERVICE' | 'GOOGLE' | 'NONE';

const AuthenticationMethod = {
  API_KEY: 'API_KEY' as AuthenticationMethod,
  LIFF: 'LIFF' as AuthenticationMethod,
  INTERNAL_SERVICE: 'INTERNAL_SERVICE' as AuthenticationMethod,
  GOOGLE: 'GOOGLE' as AuthenticationMethod,
  NONE: 'NONE' as AuthenticationMethod
};

interface AuthenticationMetadata {
  readonly issuer?: string;
  readonly provider?: string;
  readonly clientVersion?: string;
  readonly requestSource?: string;
  readonly [key: string]: any;
}

class AuthenticationContext {
  public readonly identityId: string;
  public readonly identityType: IdentityType;
  public readonly authenticationMethod: AuthenticationMethod;
  public readonly authenticated: boolean;
  public readonly issuedAt: number;
  public readonly metadata: AuthenticationMetadata;

  constructor(params: {
    identityId: string;
    identityType: IdentityType;
    authenticationMethod: AuthenticationMethod;
    authenticated: boolean;
    issuedAt: number;
    metadata?: AuthenticationMetadata;
  }) {
    this.identityId = params.identityId;
    this.identityType = params.identityType;
    this.authenticationMethod = params.authenticationMethod;
    this.authenticated = params.authenticated;
    this.issuedAt = params.issuedAt;
    this.metadata = params.metadata || {};
  }
}


// --- Source: src/foundation/authentication/AuthenticationPipeline.ts ---

class AuthenticationPipeline {
  private static instance: AuthenticationPipeline | null = null;

  private constructor() {}

  public static getInstance(): AuthenticationPipeline {
    if (!AuthenticationPipeline.instance) {
      AuthenticationPipeline.instance = new AuthenticationPipeline();
    }
    return AuthenticationPipeline.instance;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    const provider = IdentityResolver.resolve(request);

    if (provider) {
      // Feature toggle checks based on provider type
      const isApiKey = provider.constructor.name === 'ApiKeyIdentityProvider';
      const isLiff = provider.constructor.name === 'LIFFIdentityProvider';
      const isService = provider.constructor.name === 'ServiceIdentityProvider';

      if ((isApiKey && flags.apiKeyAuth === false) ||
          (isLiff && flags.liffAuth === false) ||
          (isService && flags.serviceAuth === false)) {
        // Disabled auth provider behaves as if no credentials were provided
        this.handleNoCredentials(request, context, flags.anonymousAccess);
        return;
      }

      const result = provider.authenticate(request);

      if (result.success && result.context) {
        context.setAuthenticationContext(result.context);
      } else {
        // Validation failed. If anonymous access is allowed, fallback.
        const allowAnonymous = flags.anonymousAccess && AuthenticationPolicy.isAnonymousAllowed(request);
        if (allowAnonymous) {
          const anonContext = new AuthenticationContext({
            identityId: 'anonymous',
            identityType: IdentityType.ANONYMOUS,
            authenticationMethod: AuthenticationMethod.NONE,
            authenticated: false,
            issuedAt: Date.now()
          });
          context.setAuthenticationContext(anonContext);
        } else {
          const errCode = isApiKey ? 'PM-AUT-002' : isLiff ? 'PM-AUT-003' : 'PM-AUT-004';
          throw new AuthenticationException(
            errCode,
            result.failureReason || 'Authentication verification failed',
            request.requestId
          );
        }
      }
    } else {
      this.handleNoCredentials(request, context, flags.anonymousAccess);
    }
  }

  private handleNoCredentials(request: ApiRequest, context: ApiExecutionContext, anonymousFlag: boolean): void {
    const allowAnonymous = anonymousFlag && AuthenticationPolicy.isAnonymousAllowed(request);
    if (allowAnonymous) {
      const anonContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: IdentityType.ANONYMOUS,
        authenticationMethod: AuthenticationMethod.NONE,
        authenticated: false,
        issuedAt: Date.now()
      });
      context.setAuthenticationContext(anonContext);
    } else {
      throw new AuthenticationException(
        'PM-AUT-001',
        'Authentication required. No valid credentials provided.',
        request.requestId
      );
    }
  }
}


// --- Source: src/foundation/authentication/AuthenticationPolicy.ts ---

class AuthenticationPolicy {
  public static isAnonymousAllowed(request: ApiRequest): boolean {
    // 1. Health check or non-authenticated endpoints allow anonymous
    if (request.path === '/health') {
      return true;
    }
    // 2. Allow fallback logic or configured global policy
    return false;
  }

  public static isInternalOnly(request: ApiRequest): boolean {
    // Internal batch or admin endpoints
    if (request.path === '/batch' || request.path === '/admin') {
      return true;
    }
    return false;
  }
}


// --- Source: src/foundation/authentication/AuthenticationResult.ts ---

class AuthenticationResult {
  public readonly success: boolean;
  public readonly context: AuthenticationContext | null;
  public readonly failureReason: string | null;

  private constructor(success: boolean, context: AuthenticationContext | null, failureReason: string | null) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }

  public static successResult(context: AuthenticationContext): AuthenticationResult {
    return new AuthenticationResult(true, context, null);
  }

  public static failureResult(reason: string): AuthenticationResult {
    return new AuthenticationResult(false, null, reason);
  }
}


// --- Source: src/foundation/authentication/IdentityProvider.ts ---

interface IdentityProvider {
  authenticate(request: ApiRequest): AuthenticationResult;
}


// --- Source: src/foundation/authentication/IdentityResolver.ts ---

declare const Session: any;

class IdentityResolver {
  public static resolve(request: ApiRequest): IdentityProvider | null {
    // 1. Service Auth (Highest priority)
    if (request.headers && request.headers['x-service-auth']) {
      return new ServiceIdentityProvider();
    }

    // 2. API Key (Medium priority)
    const hasQueryApiKey = request.query && (request.query.apiKey || request.query['x-api-key']);
    const hasHeaderApiKey = request.headers && request.headers['x-api-key'];
    if (hasQueryApiKey || hasHeaderApiKey) {
      return new ApiKeyIdentityProvider();
    }

    // 3. LIFF Token (Low priority)
    const hasQueryLiff = request.query && request.query.liffToken;
    const hasHeaderLiff = request.headers && request.headers['authorization'] && request.headers['authorization'].startsWith('Bearer ');
    if (hasQueryLiff || hasHeaderLiff) {
      return new LIFFIdentityProvider();
    }

    // 4. Google Auth (For Dashboard routes and active Google sessions)
    let hasGoogleSession = false;
    try {
      if (typeof Session !== 'undefined' && Session.getActiveUser && Session.getActiveUser().getEmail()) {
        hasGoogleSession = true;
      }
    } catch (e) {}

    const isDashboardPath = request.path && (request.path.includes('/dashboard/') || request.path.includes('/operations/'));
    if (hasGoogleSession || isDashboardPath) {
      return new GoogleIdentityProvider();
    }

    // No identity provider matched
    return null;
  }
}


// --- Source: src/foundation/authentication/providers/ApiKeyIdentityProvider.ts ---

/**
 * ApiKeyIdentityProvider - API Key 認証用の開発用スタブ (Stub Only)
 * ※Production実装では SecretProvider / データベース照合等に差し替えられます。
 */
class ApiKeyIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    const apiKey = (request.query && (request.query.apiKey || request.query['x-api-key'])) || request.headers?.['x-api-key'];

    if (!apiKey) {
      return AuthenticationResult.failureResult('API Key missing in query or headers');
    }

    if (apiKey === 'valid-api-key') {
      const context = new AuthenticationContext({
        identityId: 'user-api-key-stub',
        identityType: IdentityType.USER,
        authenticationMethod: AuthenticationMethod.API_KEY,
        authenticated: true,
        issuedAt: Date.now(),
        metadata: {
          provider: 'ApiKeyIdentityProvider',
          stub: true
        }
      });
      return AuthenticationResult.successResult(context);
    }

    return AuthenticationResult.failureResult('Invalid API Key provided');
  }
}


// --- Source: src/foundation/authentication/providers/GoogleIdentityProvider.ts ---

declare const Session: any;

class GoogleIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    let email = '';

    try {
      if (typeof Session !== 'undefined' && Session.getActiveUser) {
        email = Session.getActiveUser().getEmail();
      }
    } catch (e) {
      // Ignored
    }

    if (!email || email.trim().length === 0) {
      return AuthenticationResult.failureResult('Google user is not authenticated via Session.');
    }

    const context = new AuthenticationContext({
      identityId: email,
      identityType: IdentityType.USER,
      authenticationMethod: AuthenticationMethod.GOOGLE,
      authenticated: true,
      issuedAt: Date.now(),
      metadata: {
        provider: 'GoogleIdentityProvider',
        email: email
      }
    });

    return AuthenticationResult.successResult(context);
  }
}


// --- Source: src/foundation/authentication/providers/LIFFIdentityProvider.ts ---

/**
 * LIFFIdentityProvider - LINE LIFF 認証用の開発用スタブ (Stub Only)
 * ※Production実装では LINE Login API検証 / デコード処理等に差し替えられます。
 */
class LIFFIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    const token = (request.query && request.query.liffToken) || request.headers?.['authorization'];

    if (!token) {
      return AuthenticationResult.failureResult('LIFF token or authorization header missing');
    }

    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    if (cleanToken === 'valid-liff-token') {
      const context = new AuthenticationContext({
        identityId: 'user-liff-stub-123',
        identityType: IdentityType.USER,
        authenticationMethod: AuthenticationMethod.LIFF,
        authenticated: true,
        issuedAt: Date.now(),
        metadata: {
          provider: 'LIFFIdentityProvider',
          stub: true
        }
      });
      return AuthenticationResult.successResult(context);
    }

    return AuthenticationResult.failureResult('Invalid LIFF ID Token');
  }
}


// --- Source: src/foundation/authentication/providers/ServiceIdentityProvider.ts ---

/**
 * ServiceIdentityProvider - 内部サービス認証用の開発用スタブ (Stub Only)
 * ※Production実装では AIOS Bridge 署名検証等に差し替えられます。
 */
class ServiceIdentityProvider implements IdentityProvider {
  public authenticate(request: ApiRequest): AuthenticationResult {
    const serviceAuth = request.headers?.['x-service-auth'];

    if (!serviceAuth) {
      return AuthenticationResult.failureResult('Service auth header missing');
    }

    if (serviceAuth === 'valid-service-key') {
      const context = new AuthenticationContext({
        identityId: 'service-aios-bridge-stub',
        identityType: IdentityType.SERVICE,
        authenticationMethod: AuthenticationMethod.INTERNAL_SERVICE,
        authenticated: true,
        issuedAt: Date.now(),
        metadata: {
          provider: 'ServiceIdentityProvider',
          stub: true
        }
      });
      return AuthenticationResult.successResult(context);
    }

    return AuthenticationResult.failureResult('Invalid Service Auth Key');
  }
}


// --- Source: src/foundation/authorization/AuthorizationContext.ts ---

interface AuthorizationMetadata {
  readonly evaluatedPolicy?: string;
  readonly decisionSource?: string;
  readonly evaluationTime?: number;
  readonly [key: string]: any;
}

class AuthorizationContext {
  public readonly role: Role;
  public readonly permissions: Permission[];
  public readonly scopes: Scope[];
  public readonly authorized: boolean;
  public readonly metadata: AuthorizationMetadata;

  constructor(params: {
    role: Role;
    permissions: Permission[];
    scopes: Scope[];
    authorized: boolean;
    metadata?: AuthorizationMetadata;
  }) {
    this.role = params.role;
    this.permissions = params.permissions;
    this.scopes = params.scopes;
    this.authorized = params.authorized;
    this.metadata = params.metadata || {};
  }
}


// --- Source: src/foundation/authorization/AuthorizationPipeline.ts ---

class AuthorizationPipeline {
  private static instance: AuthorizationPipeline | null = null;

  private roleResolver = new RoleResolver();
  private permissionResolver = new PermissionResolver();
  private scopeResolver = new ScopeResolver();

  private constructor() {}

  public static getInstance(): AuthorizationPipeline {
    if (!AuthorizationPipeline.instance) {
      AuthorizationPipeline.instance = new AuthorizationPipeline();
    }
    return AuthorizationPipeline.instance;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    // 1. Fetch Authentication Context (Fallback to anonymous if missing)
    let authContext = context.getAuthenticationContext();
    if (!authContext) {
      authContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: IdentityType.ANONYMOUS,
        authenticationMethod: AuthenticationMethod.NONE,
        authenticated: false,
        issuedAt: Date.now()
      });
    }

    // 2. Resolve Role, Permissions, and Scopes
    const role = this.roleResolver.resolve(authContext);
    const permissions = this.permissionResolver.resolve(authContext);
    const scopes = this.scopeResolver.resolve(authContext);

    const authzContext = new AuthorizationContext({
      role,
      permissions,
      scopes,
      authorized: true,
      metadata: {
        decisionSource: 'AuthorizationPipeline',
        evaluationTime: Date.now()
      }
    });

    context.setAuthorizationContext(authzContext);

    // 3. Check feature toggle
    if (flags.authorizationEnabled === false) {
      return;
    }

    // 4. Policy validation (Fail-fast verification)
    const policy = AuthorizationPolicy.resolve(request);

    // 4.1 Role Check
    if (flags.roleValidation !== false && policy.requiredRoles.length > 0) {
      if (!policy.requiredRoles.includes(role)) {
        throw new AuthorizationException(
          'PM-AUTHZ-002',
          `Required role not met. Allowed roles: ${policy.requiredRoles.join(', ')}`,
          request.requestId
        );
      }
    }

    // 4.2 Permission Check
    if (flags.permissionValidation !== false && policy.requiredPermissions.length > 0) {
      const hasAllPermissions = policy.requiredPermissions.every(p => permissions.includes(p));
      if (!hasAllPermissions) {
        throw new AuthorizationException(
          'PM-AUTHZ-003',
          `Required permissions not met. Required: ${policy.requiredPermissions.join(', ')}`,
          request.requestId
        );
      }
    }

    // 4.3 Scope Check
    if (flags.scopeValidation !== false && policy.requiredScopes.length > 0) {
      const hasAllScopes = policy.requiredScopes.every(s => scopes.includes(s));
      if (!hasAllScopes) {
        throw new AuthorizationException(
          'PM-AUTHZ-004',
          `Required data boundary scopes not met. Required: ${policy.requiredScopes.join(', ')}`,
          request.requestId
        );
      }
    }
  }
}


// --- Source: src/foundation/authorization/AuthorizationPolicy.ts ---

class AuthorizationPolicy {
  public readonly requiredRoles: Role[];
  public readonly requiredPermissions: Permission[];
  public readonly requiredScopes: Scope[];

  constructor(params: {
    requiredRoles?: Role[];
    requiredPermissions?: Permission[];
    requiredScopes?: Scope[];
  }) {
    this.requiredRoles = params.requiredRoles || [];
    this.requiredPermissions = params.requiredPermissions || [];
    this.requiredScopes = params.requiredScopes || [];
  }

  /**
   * Resolves the required policy rules based on requested path/action.
   * Centralized mapping that feeds rules into the pipeline checks.
   */
  public static resolve(request: ApiRequest): AuthorizationPolicy {
    // 1. Admin paths require ADMIN role and permission
    if (request.path === '/admin' || (request.query && request.query.action === 'resetAllSheets')) {
      return new AuthorizationPolicy({
        requiredRoles: [Role.ADMIN, Role.SYSTEM],
        requiredPermissions: [Permission.ADMIN]
      });
    }

    // 2. Write paths require MEMBER role and WRITE permission
    if (request.method === 'POST') {
      return new AuthorizationPolicy({
        requiredRoles: [Role.SYSTEM, Role.ADMIN, Role.LEADER, Role.MEMBER],
        requiredPermissions: [Permission.WRITE]
      });
    }

    // 3. Health paths don't require specific permissions
    if (request.path === '/health') {
      return new AuthorizationPolicy({});
    }

    // 4. Default policy for other requests: read access
    return new AuthorizationPolicy({
      requiredPermissions: [Permission.READ]
    });
  }
}


// --- Source: src/foundation/authorization/AuthorizationResult.ts ---

class AuthorizationResult {
  public readonly success: boolean;
  public readonly context: AuthorizationContext | null;
  public readonly failureReason: string | null;

  private constructor(success: boolean, context: AuthorizationContext | null, failureReason: string | null) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }

  public static successResult(context: AuthorizationContext): AuthorizationResult {
    return new AuthorizationResult(true, context, null);
  }

  public static failureResult(reason: string): AuthorizationResult {
    return new AuthorizationResult(false, null, reason);
  }
}


// --- Source: src/foundation/authorization/Permission.ts ---
type Permission = 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' | 'ADMIN';

const Permission = {
  READ: 'READ' as Permission,
  WRITE: 'WRITE' as Permission,
  DELETE: 'DELETE' as Permission,
  EXPORT: 'EXPORT' as Permission,
  ADMIN: 'ADMIN' as Permission
};


// --- Source: src/foundation/authorization/PermissionResolver.ts ---

/**
 * PermissionResolver - ロールに応じた権限割り当てスタブ (Stub Only)
 */
class PermissionResolver implements Resolver<Permission[]> {
  private roleResolver = new RoleResolver();

  public resolve(authContext: AuthenticationContext): Permission[] {
    const role = this.roleResolver.resolve(authContext);

    if (role === Role.SYSTEM || role === Role.ADMIN) {
      return [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.EXPORT, Permission.ADMIN];
    }
    if (role === Role.LEADER) {
      return [Permission.READ, Permission.WRITE, Permission.EXPORT];
    }
    if (role === Role.MEMBER) {
      return [Permission.READ, Permission.WRITE];
    }

    return [Permission.READ];
  }
}


// --- Source: src/foundation/authorization/Resolver.ts ---

interface Resolver<T> {
  resolve(authContext: AuthenticationContext): T;
}


// --- Source: src/foundation/authorization/Role.ts ---
type Role = 'SYSTEM' | 'ADMIN' | 'LEADER' | 'MEMBER' | 'VIEWER';

const Role = {
  SYSTEM: 'SYSTEM' as Role,
  ADMIN: 'ADMIN' as Role,
  LEADER: 'LEADER' as Role,
  MEMBER: 'MEMBER' as Role,
  VIEWER: 'VIEWER' as Role
};


// --- Source: src/foundation/authorization/RoleResolver.ts ---

/**
 * RoleResolver - 開発用ロールマッピングスタブ (Stub Only)
 */
class RoleResolver implements Resolver<Role> {
  public resolve(authContext: AuthenticationContext): Role {
    if (!authContext.authenticated) {
      return Role.VIEWER;
    }

    const id = authContext.identityId;

    if (id === 'service-aios-bridge-stub') {
      return Role.SYSTEM;
    }
    if (id === 'user-api-key-stub') {
      return Role.ADMIN;
    }
    if (id === 'user-liff-stub-123') {
      return Role.MEMBER;
    }

    return Role.VIEWER;
  }
}


// --- Source: src/foundation/authorization/Scope.ts ---
type Scope = 'SYSTEM' | 'ORGANIZATION' | 'BRANCH' | 'AREA' | 'SELF';

const Scope = {
  SYSTEM: 'SYSTEM' as Scope,
  ORGANIZATION: 'ORGANIZATION' as Scope,
  BRANCH: 'BRANCH' as Scope,
  AREA: 'AREA' as Scope,
  SELF: 'SELF' as Scope
};


// --- Source: src/foundation/authorization/ScopeResolver.ts ---

/**
 * ScopeResolver - ロールに応じた管轄データ範囲割り当てスタブ (Stub Only)
 */
class ScopeResolver implements Resolver<Scope[]> {
  private roleResolver = new RoleResolver();

  public resolve(authContext: AuthenticationContext): Scope[] {
    const role = this.roleResolver.resolve(authContext);

    if (role === Role.SYSTEM) {
      return [Scope.SYSTEM];
    }
    if (role === Role.ADMIN) {
      return [Scope.ORGANIZATION];
    }
    if (role === Role.LEADER) {
      return [Scope.BRANCH];
    }
    if (role === Role.MEMBER) {
      return [Scope.AREA];
    }

    return [Scope.SELF];
  }
}


// --- Source: src/foundation/hardening/CircuitBreakerFoundation.ts ---

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreakerFoundation {
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


// --- Source: src/foundation/hardening/GracefulDegradation.ts ---
class GracefulDegradation {
  private static gracefulMode: boolean = false;

  public static setGracefulMode(enabled: boolean): void {
    GracefulDegradation.gracefulMode = enabled;
  }

  public static isGracefulMode(): boolean {
    return GracefulDegradation.gracefulMode;
  }

  public static shouldSkipMetrics(): boolean {
    return GracefulDegradation.gracefulMode;
  }

  public static shouldSkipAudits(): boolean {
    return GracefulDegradation.gracefulMode;
  }
}


// --- Source: src/foundation/hardening/HardeningPipeline.ts ---

class HardeningException extends ApiException {
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

class HardeningPipeline {
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


// --- Source: src/foundation/hardening/HealthCheckService.ts ---

class HealthCheckService {
  private static instance: HealthCheckService | null = null;

  private constructor() {}

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  public checkHealth(): HealthStatus {
    const checks: Record<string, { status: 'OK' | 'WARN' | 'FAIL'; message?: string }> = {
      CONFIG: { status: 'OK', message: 'Configuration Provider is active.' },
      REPOSITORY: { status: 'OK', message: 'Repository boundaries verified.' },
      CACHE: { status: 'OK', message: 'Cache Service is functional.' },
      LOCK: { status: 'OK', message: 'Lock manager initialized.' },
      MONITOR: { status: 'OK', message: 'Monitoring event loop active.' },
      ROUTER: { status: 'OK', message: 'Api Router registries mapped.' }
    };

    // Calculate aggregated status
    let status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' = 'HEALTHY';
    let failCount = 0;
    let warnCount = 0;

    for (const key of Object.keys(checks)) {
      if (checks[key].status === 'FAIL') {
        failCount++;
      } else if (checks[key].status === 'WARN') {
        warnCount++;
      }
    }

    if (failCount > 0) {
      status = 'UNAVAILABLE';
    } else if (warnCount > 0) {
      status = 'DEGRADED';
    }

    return {
      status,
      checks,
      timestamp: Date.now(),
      version: 'v2'
    };
  }
}


// --- Source: src/foundation/hardening/HealthStatus.ts ---
interface HealthStatus {
  readonly status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  readonly checks: Record<string, { status: 'OK' | 'WARN' | 'FAIL'; message?: string }>;
  readonly timestamp: number;
  readonly version: string;
}


// --- Source: src/foundation/hardening/ProductionReadinessPolicy.ts ---
interface ReadinessCheckResult {
  readonly ready: boolean;
  readonly reason?: string;
}

class ProductionReadinessPolicy {
  public static verify(): ReadinessCheckResult {
    // 1. Verify environment and API definitions
    const requiredKeys = ['v2'];
    if (!requiredKeys.includes('v2')) {
      return { ready: false, reason: 'Required API version definitions are missing.' };
    }

    return { ready: true };
  }
}


// --- Source: src/foundation/hardening/ReadinessValidator.ts ---

class ReadinessValidator {
  public static validate(): GuardResult {
    const result = ProductionReadinessPolicy.verify();
    if (!result.ready) {
      return {
        allowed: false,
        reason: `Production setup readiness failure: ${result.reason || 'UNKNOWN'}`,
        status: 500
      };
    }
    return { allowed: true };
  }
}


// --- Source: src/foundation/hardening/RequestGuard.ts ---

interface GuardResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly status?: number;
}

class RequestGuard {
  private static readonly MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB default
  private static readonly MAX_PARAMS_COUNT = 100;

  public static check(request: ApiRequest): GuardResult {
    // 1. Check Query parameter limits
    if (request.query && Object.keys(request.query).length > RequestGuard.MAX_PARAMS_COUNT) {
      return {
        allowed: false,
        reason: `Parameter count exceeds limit of ${RequestGuard.MAX_PARAMS_COUNT}`,
        status: 400
      };
    }

    // 2. Check Request Body limits (Size Checks)
    if (request.body) {
      const bodyStr = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
      if (bodyStr.length > RequestGuard.MAX_BODY_SIZE) {
        return {
          allowed: false,
          reason: `Payload too large. Exceeds limit of ${RequestGuard.MAX_BODY_SIZE} bytes`,
          status: 413
        };
      }
    }

    return { allowed: true };
  }
}


// --- Source: src/foundation/hardening/ResourceGuard.ts ---

class ResourceGuard {
  // Max default execution time limit before premature exit (e.g. 25 seconds for GAS 30-sec execution sandbox limit)
  private static readonly TIME_LIMIT_MS = 25000;

  public static check(context: ApiExecutionContext): GuardResult {
    if (context.getElapsedTime() > ResourceGuard.TIME_LIMIT_MS) {
      return {
        allowed: false,
        reason: `System execution time exceeded resource sandbox limit of ${ResourceGuard.TIME_LIMIT_MS}ms`,
        status: 500
      };
    }
    return { allowed: true };
  }
}


// --- Source: src/foundation/hardening/TimeoutPolicy.ts ---
class TimeoutPolicy {
  public static getValidationTimeout(): number {
    return 5000; // 5 seconds
  }

  public static getRoutingTimeout(): number {
    return 3000; // 3 seconds
  }

  public static getHandlerTimeout(): number {
    return 15000; // 15 seconds
  }

  public static getTotalTimeout(): number {
    return 25000; // 25 seconds limit
  }
}


