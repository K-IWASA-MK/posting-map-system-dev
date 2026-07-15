import { RoutingPath } from "./RoutingPath";

export interface RoutingProvider {
  readonly pathId: RoutingPath;
  route(payload: any): Promise<void>;
}

export class RoutingRegistry {
  private providers: Map<RoutingPath, RoutingProvider> = new Map();

  public register(provider: RoutingProvider): void {
    this.providers.set(provider.pathId, provider);
  }

  public resolve(pathId: RoutingPath): RoutingProvider | undefined {
    return this.providers.get(pathId);
  }

  public unregister(pathId: RoutingPath): void {
    this.providers.delete(pathId);
  }

  public list(): RoutingProvider[] {
    return Array.from(this.providers.values());
  }
}
