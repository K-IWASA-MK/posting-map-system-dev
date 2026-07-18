import { DataClassification } from "../contracts/AutonomousTriggerContract";

export class DataLeakagePolicy {
  // Common sensitive key patterns
  private static readonly SECRET_PATTERNS = [
    /api[-_]?key/i,
    /secret/i,
    /token/i,
    /private[-_]?key/i,
    /bearer\s+[a-zA-Z0-9\._\-]+/i,
    /ghp_[a-zA-Z0-9]{36}/, // GitHub PAT
    /sk-[a-zA-Z0-9]{48}/,  // OpenAI secret key
    /AI_KEY/i,
    /BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY/
  ];

  // Common internal structure / trace patterns
  private static readonly CONFIDENTIAL_PATTERNS = [
    /Volumes\/SSD_DATA/i,
    /internal[-_]?trace/i,
    /audit[-_]?ledger/i,
    /private[-_]?config/i,
    /system[-_]?architecture/i
  ];

  /**
   * Evaluates the classification of the given content string.
   */
  public classify(content: string): DataClassification {
    for (const pattern of DataLeakagePolicy.SECRET_PATTERNS) {
      if (pattern.test(content)) {
        return "SECRET";
      }
    }

    for (const pattern of DataLeakagePolicy.CONFIDENTIAL_PATTERNS) {
      if (pattern.test(content)) {
        return "CONFIDENTIAL";
      }
    }

    // Default to INTERNAL if it mentions any code-like elements, or PUBLIC otherwise
    if (content.includes("export class") || content.includes("function") || content.includes("import ")) {
      return "INTERNAL";
    }

    return "PUBLIC";
  }

  /**
   * Asserts whether content is safe to output/process.
   * Disallows SECRET or CONFIDENTIAL data in autonomous outputs.
   */
  public validateContent(content: string): { allowed: boolean; classification: DataClassification; reason?: string } {
    const classification = this.classify(content);
    if (classification === "SECRET" || classification === "CONFIDENTIAL") {
      return {
        allowed: false,
        classification,
        reason: `Security Block: Content classified as ${classification} which is restricted from output.`
      };
    }
    return { allowed: true, classification };
  }
}
