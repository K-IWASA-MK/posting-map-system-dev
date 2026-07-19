import { ElectionDashboardStorageSchema, StorageMetadata } from "../contracts/ElectionDashboardStorageContract";
import { ElectionTurnoutViewModel } from "../../consumer/contracts/ElectionDashboardConsumerContract";

export function deepFreeze<T extends object>(obj: T): T {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (value !== null && (typeof value === "object" || typeof value === "function") && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return obj;
}

export class ElectionDashboardStorage implements ElectionDashboardStorageSchema {
  public readonly storageId: string;
  public readonly version: string;
  public readonly sourceType: "ELECTION_DASHBOARD_VIEW_MODEL" = "ELECTION_DASHBOARD_VIEW_MODEL";
  public readonly electionId: string;
  public readonly metadata: StorageMetadata;
  public readonly data: ElectionTurnoutViewModel;

  constructor(
    storageId: string,
    version: string,
    electionId: string,
    metadata: StorageMetadata,
    data: ElectionTurnoutViewModel
  ) {
    this.storageId = storageId;
    this.version = version;
    this.electionId = electionId;
    
    // Deep clone parameters to prevent mutations via references
    this.metadata = JSON.parse(JSON.stringify(metadata));
    this.data = JSON.parse(JSON.stringify(data));

    // Recursively freeze entire object structure (including metadata and data array objects)
    deepFreeze(this);
  }

  /**
   * Helper to serialize model to JSON securely.
   */
  public toJSON(): string {
    return JSON.stringify({
      storageId: this.storageId,
      version: this.version,
      sourceType: this.sourceType,
      electionId: this.electionId,
      metadata: this.metadata,
      data: this.data
    });
  }
}
