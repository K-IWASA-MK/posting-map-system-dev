import * as crypto from "crypto";
import { ElectionTurnoutViewModel } from "../../consumer/contracts/ElectionDashboardConsumerContract";
import { ElectionDashboardStorageSchema, StorageEvent, StorageEventType } from "../contracts/ElectionDashboardStorageContract";
import { ElectionDashboardStorageWriter } from "../writer/ElectionDashboardStorageWriter";
import { ElectionDashboardStorageReader } from "../reader/ElectionDashboardStorageReader";
import { DashboardStorageValidator } from "../validation/DashboardStorageValidator";

export class ElectionDashboardStorageRuntime {
  private readonly writer: ElectionDashboardStorageWriter;
  private readonly reader: ElectionDashboardStorageReader;
  private readonly validator: DashboardStorageValidator;

  // Track highest version processed for each storageId to achieve Replay Safety
  private readonly processedVersions = new Map<string, number>();
  
  // Subscribers list for events
  private readonly subscribers = new Set<(event: StorageEvent) => void>();

  constructor() {
    this.writer = new ElectionDashboardStorageWriter();
    this.reader = new ElectionDashboardStorageReader();
    this.validator = new DashboardStorageValidator();
  }

  /**
   * Subscribes a listener to storage events.
   * Returns an unsubscribe function.
   */
  public subscribe(sub: (event: StorageEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(event: StorageEvent): void {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[StorageRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Processes the storage pipeline for an ElectionTurnoutViewModel.
   * Performs validation, writes atomic file, verifies readback, manages versioned replays, and emits events.
   */
  public async processStorage(
    storageId: string,
    versionStr: string,
    viewModel: ElectionTurnoutViewModel,
    destinationPath: string
  ): Promise<{ status: "SUCCESS" | "SKIPPED" | "FAILED"; storage?: ElectionDashboardStorageSchema; error?: string }> {
    const numericVersion = parseInt(versionStr, 10);
    const parsedVersion = isNaN(numericVersion) ? 0 : numericVersion;

    // 1. Replay Safety / Version Check
    const lastVersion = this.processedVersions.get(storageId);
    if (lastVersion !== undefined && parsedVersion <= lastVersion) {
      console.log(`[StorageRuntime] Replay detected for ${storageId} (version ${versionStr} <= processed ${lastVersion}). Skipping.`);
      return { status: "SKIPPED" };
    }

    try {
      // Calculate contentHash for input validation
      const contentHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(viewModel))
        .digest("hex");

      // 2. Validate Input ViewModel using consumer validation logic before writing
      const inputValidation = this.validator.validate({
        storageId,
        version: versionStr,
        sourceType: "ELECTION_DASHBOARD_VIEW_MODEL",
        electionId: viewModel.electionId,
        metadata: {
          sourceLineageHash: viewModel.lineageHash || "",
          contentHash,
          generatedAt: new Date().toISOString()
        },
        data: viewModel
      });

      if (!inputValidation.success) {
        const errorMsg = `Input Validation Failed: ${inputValidation.errors.join("; ")}`;
        this.emit({
          type: "ELECTION_DASHBOARD_STORAGE_FAILED",
          storageId,
          electionId: viewModel.electionId,
          version: versionStr,
          timestamp: Date.now(),
          error: errorMsg
        });
        return { status: "FAILED", error: errorMsg };
      }

      // 3. Atomic write storage model (generates final hashes and writes)
      const storageModel = this.writer.write(storageId, versionStr, viewModel, destinationPath);

      // 4. Verify read-back content matches and passes validation
      let readBackModel: ElectionDashboardStorageSchema;
      try {
        readBackModel = this.reader.read(destinationPath);
      } catch (readErr: any) {
        const errorMsg = `Readback Integrity Verification Failed: ${readErr.message}`;
        this.emit({
          type: "ELECTION_DASHBOARD_STORAGE_FAILED",
          storageId,
          electionId: viewModel.electionId,
          version: versionStr,
          timestamp: Date.now(),
          error: errorMsg
        });
        return { status: "FAILED", error: errorMsg };
      }

      // 5. Update replay history cache
      this.processedVersions.set(storageId, parsedVersion);

      // 6. Emit STORAGE_UPDATED event on success
      this.emit({
        type: "ELECTION_DASHBOARD_STORAGE_UPDATED",
        storageId,
        electionId: storageModel.electionId,
        version: versionStr,
        hash: storageModel.metadata.contentHash,
        timestamp: Date.now()
      });

      return {
        status: "SUCCESS",
        storage: readBackModel
      };
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit({
        type: "ELECTION_DASHBOARD_STORAGE_FAILED",
        storageId,
        electionId: viewModel.electionId,
        version: versionStr,
        timestamp: Date.now(),
        error: errorMsg
      });
      return {
        status: "FAILED",
        error: errorMsg
      };
    }
  }

  /**
   * Helper to clear processing state (primarily for tests)
   */
  public clearCache(): void {
    this.processedVersions.clear();
  }
}
