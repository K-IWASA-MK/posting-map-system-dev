import { ApiRequest } from './ApiRequest';
import { EndpointHandler } from './handlers/EndpointHandler';
import { RouteResolver } from './RouteResolver';
import { DashboardHandler } from './handlers/DashboardHandler';
import { HoldingHandler } from './handlers/HoldingHandler';
import { HealthHandler } from './handlers/HealthHandler';
import { VersionHandler } from './handlers/VersionHandler';
import { UnknownEndpointHandler } from './handlers/UnknownEndpointHandler';

export class EndpointRegistry {
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
