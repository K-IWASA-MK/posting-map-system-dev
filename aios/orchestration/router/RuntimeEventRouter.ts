import { RuntimeEvent } from "../contracts/RuntimeEventContract";

export class RuntimeEventRouter {
  // Deterministic Routing Map connecting sequential runtimes in a closed development loop
  private static readonly ROUTING_MAP: Record<string, readonly string[]> = {
    EXECUTION_COMPLETED: ["ValidationRuntime"],
    VALIDATION_COMPLETED: ["AuditRuntime"],
    AUDIT_RECORDED: ["CompletionRuntime"],
    COMPLETION_COMPLETED: ["LearningRuntime"],
    LEARNING_UPDATED: [] // End of development integration loop
  };

  /**
   * Resolves the target runtimes configured to receive the given event type.
   */
  public static route(event: RuntimeEvent): readonly string[] {
    return this.ROUTING_MAP[event.eventType] || [];
  }
}
