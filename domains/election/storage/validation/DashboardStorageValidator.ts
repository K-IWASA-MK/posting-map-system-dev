import * as crypto from "crypto";
import { ElectionDashboardStorageSchema } from "../contracts/ElectionDashboardStorageContract";
import { ConsumerValidator } from "../../consumer/validation/ConsumerValidator";

export class DashboardStorageValidator {
  private readonly consumerValidator: ConsumerValidator;

  constructor() {
    this.consumerValidator = new ConsumerValidator();
  }

  /**
   * Validates the integrity of the ElectionDashboardStorage schema.
   * Asserts existence of mandatory attributes, validates contentHash correctness,
   * and delegates data schema validation to ConsumerValidator.
   */
  public validate(storage: ElectionDashboardStorageSchema): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Mandatory schema check
    if (!storage) {
      return { success: false, errors: ["Validation Error: storage object is null or undefined."] };
    }
    if (!storage.storageId || typeof storage.storageId !== "string" || storage.storageId.trim() === "") {
      errors.push("Validation Error: storageId is missing or empty.");
    }
    if (!storage.version || typeof storage.version !== "string" || storage.version.trim() === "") {
      errors.push("Validation Error: version is missing or empty.");
    }
    if (storage.sourceType !== "ELECTION_DASHBOARD_VIEW_MODEL") {
      errors.push(`Validation Error: sourceType must be 'ELECTION_DASHBOARD_VIEW_MODEL', got '${storage.sourceType}'`);
    }
    if (!storage.electionId || typeof storage.electionId !== "string" || storage.electionId.trim() === "") {
      errors.push("Validation Error: electionId is missing or empty.");
    }

    // 2. Metadata validation
    if (!storage.metadata) {
      errors.push("Validation Error: metadata object is missing.");
      return { success: false, errors };
    }

    const sha256Regex = /^[a-f0-9]{64}$/i;
    
    // contentHash format verification
    if (!storage.metadata.contentHash || !sha256Regex.test(storage.metadata.contentHash)) {
      errors.push(`Validation Error: contentHash must be a valid SHA-256 hex string, got: '${storage.metadata.contentHash}'`);
    }

    // sourceLineageHash format verification (can be empty if not supplied, but if exists must be SHA-256)
    if (storage.metadata.sourceLineageHash && !sha256Regex.test(storage.metadata.sourceLineageHash)) {
      errors.push(`Validation Error: sourceLineageHash must be a valid SHA-256 hex string, got: '${storage.metadata.sourceLineageHash}'`);
    }

    if (!storage.metadata.generatedAt || isNaN(Date.parse(storage.metadata.generatedAt))) {
      errors.push("Validation Error: metadata.generatedAt is missing or invalid date string.");
    }

    // 3. Delegate inner data validation to ConsumerValidator
    if (!storage.data) {
      errors.push("Validation Error: data (ElectionTurnoutViewModel) is missing.");
    } else {
      const consumerResult = this.consumerValidator.validate(storage.data);
      if (!consumerResult.success) {
        errors.push(...consumerResult.errors.map(err => `Data Validation: ${err}`));
      }

      // Check for specific value corruption blocks
      if (storage.data.districts) {
        for (const dist of storage.data.districts) {
          if (dist.turnout === null || dist.turnout === undefined || isNaN(dist.turnout)) {
            errors.push(`Validation Error: District ${dist.id} has null or undefined turnout.`);
          }
        }
      }
      if (storage.data.municipalities) {
        for (const muni of storage.data.municipalities) {
          if (muni.turnout === null || muni.turnout === undefined || isNaN(muni.turnout)) {
            errors.push(`Validation Error: Municipality ${muni.code} has null or undefined turnout.`);
          }
        }
      }

      // 4. Content Hash Integrity validation
      if (storage.metadata.contentHash && errors.length === 0) {
        const dataString = JSON.stringify(storage.data);
        const calculatedHash = crypto
          .createHash("sha256")
          .update(dataString)
          .digest("hex");

        if (calculatedHash !== storage.metadata.contentHash) {
          errors.push(`Validation Error: contentHash mismatch. Stored: '${storage.metadata.contentHash}', Calculated: '${calculatedHash}'`);
        }
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}
