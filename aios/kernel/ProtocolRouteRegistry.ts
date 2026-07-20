export interface ProtocolRoute {
  readonly protocolId: string;
  readonly defaultTargetAgents: readonly string[];
  readonly resolveTargets?: (payload: any) => readonly string[];
}

export class ProtocolRouteRegistry {
  private static readonly routes = new Map<string, ProtocolRoute>([
    ["aios-governance-v1", {
      protocolId: "aios-governance-v1",
      defaultTargetAgents: ["agent-architecture"],
      resolveTargets: (payload) => {
        const executors = Array.isArray(payload?.executors) ? payload.executors : [];
        const reviewers = Array.isArray(payload?.reviewers) ? payload.reviewers : [];
        return Array.from(new Set([...executors, ...reviewers]));
      }
    }],
    ["aios-decision-v1", {
      protocolId: "aios-decision-v1",
      defaultTargetAgents: ["agent-architecture", "agent-uiux"],
      resolveTargets: (payload) => {
        // If specific signatories or capability bounds are needed, extract here
        return ["agent-architecture", "agent-uiux"];
      }
    }],
    ["aios-consensus-v1", {
      protocolId: "aios-consensus-v1",
      defaultTargetAgents: ["agent-architecture"]
    }],
    ["aios-capability-v1", {
      protocolId: "aios-capability-v1",
      defaultTargetAgents: ["agent-security"]
    }],
    ["aios-ledger-v1", {
      protocolId: "aios-ledger-v1",
      defaultTargetAgents: ["agent-architecture"]
    }]
  ]);

  /**
   * Resolves target agents dynamically based on the payload or defaults to standard route assignments.
   */
  public static resolve(protocolId: string, payload: unknown): readonly string[] {
    const route = this.routes.get(protocolId);
    if (!route) {
      return [];
    }
    if (route.resolveTargets) {
      try {
        const dynamicTargets = route.resolveTargets(payload);
        if (dynamicTargets.length > 0) {
          return dynamicTargets;
        }
      } catch (err) {
        // Fallback to default in case of error
      }
    }
    return route.defaultTargetAgents;
  }
}
