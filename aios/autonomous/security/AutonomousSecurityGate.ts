import { AutonomousTriggerRequest } from "../contracts/AutonomousTriggerContract";
import { TriggerVerifier } from "./TriggerVerifier";
import { DataLeakagePolicy } from "./DataLeakagePolicy";
import { SecretAccessPolicy, SecretProvider } from "./SecretAccessPolicy";

export class AutonomousSecurityGate {
  private readonly verifier: TriggerVerifier;
  private readonly leakagePolicy: DataLeakagePolicy;
  private readonly secretAccess: SecretAccessPolicy;

  constructor(secretProvider: SecretProvider) {
    this.verifier = new TriggerVerifier();
    this.leakagePolicy = new DataLeakagePolicy();
    this.secretAccess = new SecretAccessPolicy(secretProvider);
  }

  /**
   * Safe entry point for trigger processing.
   * Performs signature verification, replay protection, and data leakage checks.
   */
  public async processRequest(request: AutonomousTriggerRequest): Promise<{ success: boolean; reason?: string }> {
    try {
      // 1. Secret Access: Retrieve signature verify secret
      const triggerSecret = await this.secretAccess.getSecret("AUTONOMOUS_TRIGGER_SECRET", request.requester);

      // 2. Request signature/timestamp/nonce verification
      const verifyResult = this.verifier.verify(request, triggerSecret);
      if (!verifyResult.success) {
        return verifyResult;
      }

      // 3. Data Leakage Prevention Check on payload/parameters
      if (request.payload) {
        const payloadStr = JSON.stringify(request.payload);
        const leakageResult = this.leakagePolicy.validateContent(payloadStr);
        if (!leakageResult.allowed) {
          return { success: false, reason: leakageResult.reason };
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, reason: `Security Gate Exception: ${error.message}` };
    }
  }

  public getSecretAccessPolicy(): SecretAccessPolicy {
    return this.secretAccess;
  }

  public getTriggerVerifier(): TriggerVerifier {
    return this.verifier;
  }

  public getDataLeakagePolicy(): DataLeakagePolicy {
    return this.leakagePolicy;
  }
}
