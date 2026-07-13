import { RoutingProvider } from "./RoutingRegistry";
import { RoutingPath } from "./RoutingPath";

export class MockRoutingProvider implements RoutingProvider {
  constructor(public readonly pathId: RoutingPath) {}
  
  async route(payload: any): Promise<void> {
    // Mock routing logic
  }
}
