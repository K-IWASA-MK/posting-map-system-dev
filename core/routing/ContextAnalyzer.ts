import { RoutingContext } from "./RoutingContext";

export interface ContextAnalyzer {
  analyze(context: RoutingContext): RoutingContext;
}
