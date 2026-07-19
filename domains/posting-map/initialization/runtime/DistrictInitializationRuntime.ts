import { DistrictInitializationRequest, DistrictInitializationResult, InitializationEvent, InitializationEventType } from "../contracts/DistrictInitializationContract";
import { DistrictInitializationPreview } from "../contracts/DistrictInitializationPreview";
import { InitializationContext } from "../contracts/InitializationContext";
import { DistrictResolver } from "../contracts/DistrictResolver";
import { DistrictInitializationWorkflow } from "../models/DistrictInitializationWorkflow";
import { ImportAddressEntry } from "../../area/import/PostingAreaImportService";
import { ElectionTurnoutViewModel } from "../../../election/consumer/contracts/ElectionDashboardConsumerContract";
import { MunicipalityGeoBinding } from "../../visualization/contracts/MunicipalityGeoContract";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";

export class DistrictInitializationRuntime {
  // Memory ledger to store processed initialization IDs (migratable to persistent ledger)
  private readonly processedIds = new Set<string>();
  private readonly subscribers = new Set<(event: InitializationEvent) => void>();

  constructor(
    private readonly resolver: DistrictResolver,
    private readonly workflow: DistrictInitializationWorkflow
  ) {}

  /**
   * Subscribes a listener to initialization workflow events.
   */
  public subscribe(sub: (event: InitializationEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(type: InitializationEventType, initializationId: string, districtName: string, payload?: any, error?: string): void {
    const event: InitializationEvent = {
      type,
      initializationId,
      districtName,
      timestamp: Date.now(),
      payload,
      error
    };

    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[InitializationRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Resolves district info, validates trace context, enforces Replay Safety,
   * runs the initialization workflow, and notifies subscribers.
   */
  public async initializeDistrict(
    request: DistrictInitializationRequest,
    options: {
      readonly baseDir: string;
      readonly addressEntries?: readonly ImportAddressEntry[];
      readonly viewModel?: ElectionTurnoutViewModel;
      readonly geoBindings?: readonly MunicipalityGeoBinding[];
    }
  ): Promise<DistrictInitializationResult> {
    // 1. Validation check
    if (!request.initializationId || request.initializationId.trim() === "") {
      throw new Error("Initialization ID is required.");
    }
    if (!request.districtName || request.districtName.trim() === "") {
      throw new Error("District Name is required.");
    }

    // 2. Replay Protection check (reject duplicates)
    if (this.processedIds.has(request.initializationId)) {
      const errorMsg = `Replay Protection Violation: initializationId '${request.initializationId}' has already been processed.`;
      this.emit(
        "POSTING_MAP_INITIALIZATION_FAILED",
        request.initializationId,
        request.districtName,
        undefined,
        errorMsg
      );
      return {
        initializationId: request.initializationId,
        districtName: request.districtName,
        status: "FAILED",
        resources: [],
        error: errorMsg
      };
    }

    // Mark as started
    this.emit(
      "POSTING_MAP_INITIALIZATION_STARTED",
      request.initializationId,
      request.districtName,
      { requester: request.requester, requestedAt: request.requestedAt }
    );

    try {
      // 3. Resolve district first to make sure it's valid
      const resolved = this.resolver.resolve(request.districtName);
      
      // 4. Construct InitializationContext with trace identifiers
      const traceId = crypto.randomBytes(16).toString("hex");
      const context: InitializationContext = {
        initializationId: request.initializationId,
        districtId: resolved.districtId,
        districtName: resolved.districtName,
        traceId,
        startedAt: new Date().toISOString()
      };

      // 5. Execute workflow
      const result = await this.workflow.execute(
        request,
        context,
        options,
        (stepType, stepPayload) => {
          this.emit(
            stepType,
            request.initializationId,
            request.districtName,
            stepPayload,
            stepPayload?.error
          );
        }
      );

      if (result.status === "READY") {
        this.processedIds.add(request.initializationId);
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit(
        "POSTING_MAP_INITIALIZATION_FAILED",
        request.initializationId,
        request.districtName,
        undefined,
        errorMsg
      );
      return {
        initializationId: request.initializationId,
        districtName: request.districtName,
        status: "FAILED",
        resources: [],
        error: errorMsg
      };
    }
  }

  /**
   * Generates a preview schema status for Sales Presentation App.
   */
  public getPreview(districtName: string, baseDir: string): DistrictInitializationPreview {
    const resolved = this.resolver.resolve(districtName);
    const districtDir = path.join(baseDir, districtName);

    const areaPath = path.join(districtDir, "areas.json");
    const dashboardPath = path.join(districtDir, "dashboard.json");

    const areaStatus = fs.existsSync(areaPath) ? "READY" : "PENDING";
    const dashboardStatus = fs.existsSync(dashboardPath) ? "READY" : "PENDING";
    
    // In our simplified setup, visual runtime outputs SUCCESS projection if areas & dashboard exist
    const visualizationStatus = (areaStatus === "READY" && dashboardStatus === "READY") ? "READY" : "PENDING";

    return {
      district: districtName,
      municipalities: resolved.municipalities.map(m => m.name),
      areaStatus,
      dashboardStatus,
      visualizationStatus
    };
  }
}
