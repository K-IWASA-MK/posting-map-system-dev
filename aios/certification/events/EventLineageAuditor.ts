import { RuntimeEvent } from "../../orchestration/contracts/RuntimeEventContract";

export class EventLineageAuditor {
  /**
   * Evaluates the event chain for lineage integrity and correlation.
   */
  public audit(events: readonly RuntimeEvent[]): { success: boolean; score: number; findings: string[] } {
    const findings: string[] = [];
    let violationCount = 0;

    if (events.length === 0) {
      findings.push("Lineage Violation: No events provided for lineage audit.");
      return { success: false, score: 0, findings };
    }

    // 1. Trace ID / Correlation ID Consistency check
    const referenceCorrelationId = events[0].correlationId;
    if (!referenceCorrelationId) {
      findings.push("Lineage Violation: Initial trigger event is missing a correlationId.");
      violationCount++;
    }

    const processedEventIds = new Set<string>();

    // Expected sequential stages (subsets can be verified)
    const observedTypes = new Set<string>();

    for (const event of events) {
      observedTypes.add(event.eventType);

      // Verify identical correlationId throughout development/delivery stages
      if (event.correlationId !== referenceCorrelationId) {
        findings.push(
          `Lineage Violation: Event ${event.eventId} (${event.eventType}) correlationId mismatch: expected ${referenceCorrelationId}, found ${event.correlationId}`
        );
        violationCount++;
      }

      // Replay check
      if (processedEventIds.has(event.eventId)) {
        findings.push(`Lineage Violation: Replay safety failure. Duplicate eventId detected: ${event.eventId}`);
        violationCount++;
      }
      processedEventIds.add(event.eventId);
    }

    // Check complete chain coverage
    const expectedStages = [
      "EXECUTION_COMPLETED",
      "VALIDATION_COMPLETED",
      "AUDIT_RECORDED",
      "COMPLETION_COMPLETED"
    ];

    for (const stage of expectedStages) {
      if (!observedTypes.has(stage)) {
        findings.push(`Lineage Warning: Expected stage '${stage}' is missing from the observed chain.`);
        // Warnings don't block certification completely, but lower the score slightly
      }
    }

    const score = Math.max(0, 100 - violationCount * 25 - (expectedStages.length - observedTypes.size) * 5);
    return {
      success: violationCount === 0,
      score,
      findings
    };
  }
}
