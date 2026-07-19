import { ElectionDashboardStorageSchema } from "../../../election/storage/contracts/ElectionDashboardStorageContract";
import { MunicipalityGeoBinding } from "../contracts/MunicipalityGeoContract";
import { PostingMapVisualizationProjection } from "../models/PostingMapVisualizationProjection";
import { PostingMapVisualizationProjectionEngine } from "../engine/PostingMapVisualizationProjectionEngine";
import { VisualizationProjectionValidator } from "../validation/VisualizationProjectionValidator";
import { VisualizationEvent, MapVisualizationProjectionSchema } from "../contracts/PostingMapVisualizationContract";

export class PostingMapVisualizationRuntime {
  private readonly engine: PostingMapVisualizationProjectionEngine;
  private readonly validator: VisualizationProjectionValidator;
  private readonly subscribers = new Set<(event: VisualizationEvent) => void>();

  constructor() {
    this.engine = new PostingMapVisualizationProjectionEngine();
    this.validator = new VisualizationProjectionValidator();
  }

  /**
   * Subscribes a listener to visualization events.
   * Returns an unsubscribe function.
   */
  public subscribe(sub: (event: VisualizationEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(event: VisualizationEvent): void {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[VisualizationRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Processes the visualization projection generation from an ElectionDashboardStorage and geo boundaries.
   * Performs validation, computes hashes, applies deep freeze, and emits lifecycle events.
   */
  public async processVisualization(
    projectionId: string,
    storage: ElectionDashboardStorageSchema,
    geoBindings: readonly MunicipalityGeoBinding[]
  ): Promise<{ status: "SUCCESS" | "FAILED"; projection?: PostingMapVisualizationProjection; error?: string }> {
    try {
      // 1. Initial Storage Validation Check
      if (!storage || !storage.metadata || !storage.metadata.contentHash) {
        const errorMsg = "Input Storage is missing metadata or contentHash.";
        this.emit({
          type: "POSTING_MAP_VISUALIZATION_FAILED",
          projectionId,
          electionId: storage?.electionId ?? "unknown",
          municipalityCount: 0,
          hash: "",
          timestamp: Date.now(),
          error: errorMsg
        });
        return { status: "FAILED", error: errorMsg };
      }

      // 2. Generate visualization projection model
      const projection = this.engine.generate(projectionId, storage, geoBindings);

      // 3. Validate generated visualization projection (checking format and matching source storage hash)
      const validationResult = this.validator.validate(projection, storage.metadata.contentHash);
      if (!validationResult.success) {
        const errorMsg = `Visualization Validation Failed: ${validationResult.errors.join("; ")}`;
        this.emit({
          type: "POSTING_MAP_VISUALIZATION_FAILED",
          projectionId,
          electionId: storage.electionId,
          municipalityCount: projection.municipalities.length,
          hash: projection.metadata.visualizationHash,
          timestamp: Date.now(),
          error: errorMsg
        });
        return { status: "FAILED", error: errorMsg };
      }

      // 4. Emit MAP_VISUALIZATION_UPDATED event on success
      this.emit({
        type: "POSTING_MAP_VISUALIZATION_UPDATED",
        projectionId,
        electionId: projection.electionId,
        municipalityCount: projection.municipalities.length,
        hash: projection.metadata.visualizationHash,
        timestamp: Date.now()
      });

      return {
        status: "SUCCESS",
        projection
      };
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit({
        type: "POSTING_MAP_VISUALIZATION_FAILED",
        projectionId,
        electionId: storage?.electionId ?? "unknown",
        municipalityCount: 0,
        hash: "",
        timestamp: Date.now(),
        error: errorMsg
      });
      return {
        status: "FAILED",
        error: errorMsg
      };
    }
  }
}
