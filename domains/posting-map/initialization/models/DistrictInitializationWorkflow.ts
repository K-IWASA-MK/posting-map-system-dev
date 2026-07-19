import { DistrictResolver } from "../contracts/DistrictResolver";
import { PostingAreaRuntime } from "../../area/runtime/PostingAreaRuntime";
import { ElectionDashboardStorageRuntime } from "../../../election/storage/runtime/ElectionDashboardStorageRuntime";
import { PostingMapVisualizationRuntime } from "../../visualization/runtime/PostingMapVisualizationRuntime";
import { DistrictInitializationRequest, DistrictInitializationResult, InitializationEventType } from "../contracts/DistrictInitializationContract";
import { InitializationContext } from "../contracts/InitializationContext";
import { ImportAddressEntry } from "../../area/import/PostingAreaImportService";
import { ElectionTurnoutViewModel } from "../../../election/consumer/contracts/ElectionDashboardConsumerContract";
import { MunicipalityGeoBinding } from "../../visualization/contracts/MunicipalityGeoContract";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

export class DistrictInitializationWorkflow {
  constructor(
    private readonly resolver: DistrictResolver,
    private readonly areaRuntime: PostingAreaRuntime,
    private readonly storageRuntime: ElectionDashboardStorageRuntime,
    private readonly visualizationRuntime: PostingMapVisualizationRuntime
  ) {}

  /**
   * Orchestrates the 5-step district initialization workflow.
   * Directly interfaces with domain runtimes to initialize areas, dashboard, and map visualization.
   */
  public async execute(
    request: DistrictInitializationRequest,
    context: InitializationContext,
    options: {
      readonly baseDir: string;
      readonly addressEntries?: readonly ImportAddressEntry[];
      readonly viewModel?: ElectionTurnoutViewModel;
      readonly geoBindings?: readonly MunicipalityGeoBinding[];
    },
    onProgress: (step: InitializationEventType, payload?: any) => void
  ): Promise<DistrictInitializationResult> {
    const resources: string[] = [];

    try {
      // Step 1: District Resolve
      onProgress("POSTING_MAP_DISTRICT_RESOLVED", { step: 1, message: "Resolving district municipalities..." });
      const resolved = this.resolver.resolve(request.districtName);
      
      const districtDir = path.join(options.baseDir, request.districtName);
      if (!fs.existsSync(districtDir)) {
        fs.mkdirSync(districtDir, { recursive: true });
      }

      const areasPath = path.join(districtDir, "areas.json");
      const dashboardPath = path.join(districtDir, "dashboard.json");

      // Step 2: Area Initialization
      onProgress("POSTING_MAP_AREA_READY", { step: 2, message: "Initializing Area Master and chunking addresses..." });
      
      // Default address entries for Mie 3rd district if none provided
      const finalAddressEntries = options.addressEntries ?? [
        { address: "桑名市よしのまる", municipalityCode: "24205", municipalityName: "桑名市" },
        { address: "桑名市えば", municipalityCode: "24205", municipalityName: "桑名市" },
        { address: "いなべ市北勢町", municipalityCode: "24214", municipalityName: "いなべ市" },
        { address: "四日市市千代田", municipalityCode: "24202", municipalityName: "四日市市" }
      ];

      const areaRes = await this.areaRuntime.importAreas(
        `area-master-${resolved.districtId}`,
        resolved.districtId,
        "house-2026",
        finalAddressEntries,
        areasPath
      );

      if (areaRes.status !== "SUCCESS" || !areaRes.master) {
        throw new Error(`Area initialization failed: ${areaRes.error ?? "unknown error"}`);
      }
      resources.push(areasPath);

      // Step 3: Dashboard Preparation
      onProgress("POSTING_MAP_DASHBOARD_READY", { step: 3, message: "Preparing Turnout Dashboard Storage..." });
      
      const finalViewModel: ElectionTurnoutViewModel = options.viewModel ?? {
        sourceType: "TURNOUT_DASHBOARD_PROJECTION",
        electionId: "house-2026",
        electionDate: "2026-10-25",
        nationalTurnout: 52.4,
        districts: [
          { id: resolved.districtId, name: request.districtName, turnout: 53.1, difference: 0.7, colorStatus: "GREEN" }
        ],
        municipalities: resolved.municipalities.map(m => ({
          code: m.code,
          name: m.name,
          districtId: resolved.districtId,
          turnout: 51.5,
          national: 52.4,
          difference: -0.9,
          colorStatus: "YELLOW"
        })),
        lineageHash: crypto.randomBytes(32).toString("hex"),
        lastUpdated: new Date().toISOString()
      };

      const storageRes = await this.storageRuntime.processStorage(
        `storage-${resolved.districtId}`,
        "1",
        finalViewModel,
        dashboardPath
      );

      if (storageRes.status !== "SUCCESS" || !storageRes.storage) {
        throw new Error(`Dashboard storage initialization failed: ${storageRes.error ?? "unknown error"}`);
      }
      resources.push(dashboardPath);

      // Step 4: Visualization Preparation
      onProgress("POSTING_MAP_VISUALIZATION_READY", { step: 4, message: "Preparing Map Visualization Projections..." });
      
      const finalGeoBindings = options.geoBindings ?? resolved.municipalities.map(m => ({
        municipalityCode: m.code,
        geometryId: `geom-${m.code}`,
        geometrySource: "MUNICIPALITY_BOUNDARY" as const
      }));

      const visualRes = await this.visualizationRuntime.processVisualization(
        `vis-projection-${resolved.districtId}`,
        storageRes.storage,
        finalGeoBindings
      );

      if (visualRes.status !== "SUCCESS" || !visualRes.projection) {
        throw new Error(`Visualization initialization failed: ${visualRes.error ?? "unknown error"}`);
      }
      // Visualization data is embedded or published within the visualization lifecycle/state,
      // here we confirm visual readiness.

      // Step 5: Ready判定
      onProgress("POSTING_MAP_INITIALIZATION_COMPLETED", { step: 5, message: "All domains initialized successfully." });
      
      return {
        initializationId: request.initializationId,
        districtName: request.districtName,
        status: "READY",
        resources: Object.freeze(resources)
      };

    } catch (err: any) {
      const errorMsg = err.message || String(err);
      onProgress("POSTING_MAP_INITIALIZATION_FAILED", { error: errorMsg });
      
      return {
        initializationId: request.initializationId,
        districtName: request.districtName,
        status: "FAILED",
        resources: Object.freeze(resources),
        error: errorMsg
      };
    }
  }
}
