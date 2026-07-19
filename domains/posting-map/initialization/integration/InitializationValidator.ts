import { InitializationRequest } from "./contracts/DistrictInitializationIntegrationContract";

export class InitializationValidator {
  private readonly processedRequestIds = new Set<string>();

  /**
   * Validates the initialization request and checks for replay attacks.
   */
  public validateRequest(request: InitializationRequest): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.requestId || request.requestId.trim() === "") {
      errors.push("Validation Error: requestId is missing or empty.");
    } else {
      if (this.processedRequestIds.has(request.requestId)) {
        errors.push(
          `Validation Error: Replay Protection Triggered. requestId '${request.requestId}' has already been processed.`
        );
      }
    }

    if (!request.districtId || request.districtId.trim() === "") {
      errors.push("Validation Error: districtId is missing or empty.");
    }
    if (!request.districtName || request.districtName.trim() === "") {
      errors.push("Validation Error: districtName is missing or empty.");
    }
    if (!request.sourceHash || !/^[a-f0-9]{64}$/i.test(request.sourceHash)) {
      errors.push("Validation Error: sourceHash is missing or invalid SHA-256 format.");
    }

    return {
      success: errors.length === 0,
      errors
    };
  }

  /**
   * Registers a successfully validated requestId to lock it from future replay executions.
   */
  public registerProcessedId(requestId: string): void {
    this.processedRequestIds.add(requestId);
  }

  /**
   * Resets the replay tracker (useful in test runs).
   */
  public clearRegistry(): void {
    this.processedRequestIds.clear();
  }
}
