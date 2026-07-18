import * as crypto from "crypto";
import { AutonomousTriggerRequest } from "../contracts/AutonomousTriggerContract";

export class TriggerVerifier {
  private static readonly MAX_DRIFT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly processedNonces = new Set<string>();

  /**
   * Validates a trigger request's signature, timestamp, and nonce replay.
   */
  public verify(request: AutonomousTriggerRequest, secret: string): { success: boolean; reason?: string } {
    // 1. Verify Timestamp
    const now = Date.now();
    const drift = Math.abs(now - request.timestamp);
    if (drift > TriggerVerifier.MAX_DRIFT_MS) {
      return { success: false, reason: `Timestamp verification failed. Drift of ${drift}ms exceeds max of ${TriggerVerifier.MAX_DRIFT_MS}ms.` };
    }

    // 2. Verify Replay Nonce
    if (this.processedNonces.has(request.nonce)) {
      return { success: false, reason: `Replay Attack Detected: Nonce ${request.nonce} has already been processed.` };
    }

    // 3. Verify Signature
    // Signature message components: requester + timestamp + nonce + proposalId
    const message = `${request.requester}:${request.timestamp}:${request.nonce}:${request.proposalId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("hex");

    if (request.signature !== expectedSignature) {
      return { success: false, reason: "Signature verification failed. Invalid requester signature." };
    }

    // Mark nonce as processed
    this.processedNonces.add(request.nonce);
    return { success: true };
  }

  /**
   * Helper to generate a valid signature for tests/clients.
   */
  public static sign(requester: string, timestamp: number, nonce: string, proposalId: string, secret: string): string {
    const message = `${requester}:${timestamp}:${nonce}:${proposalId}`;
    return crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("hex");
  }

  public clear(): void {
    this.processedNonces.clear();
  }
}
