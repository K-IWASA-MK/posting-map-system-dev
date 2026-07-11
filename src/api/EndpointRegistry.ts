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
  }

  public getHandler(method: string, version: string, path: string): EndpointHandler {
    const key = RouteResolver.resolveKey(method, version, path);
    return this.routes.get(key) || this.unknownHandler;
  }
}
