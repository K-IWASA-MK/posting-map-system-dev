import { DistrictInitializationRuntime } from "../../../domains/posting-map/initialization/runtime/DistrictInitializationRuntime";
import { DistrictInitializationRequest } from "../../../domains/posting-map/initialization/contracts/DistrictInitializationContract";
import { SalesPreviewModel } from "../contracts/SalesPreviewContract";
import { SalesPreviewAdapter } from "../adapter/SalesPreviewAdapter";
import { SalesPreviewValidator } from "../validation/SalesPreviewValidator";
import { ImportAddressEntry } from "../../../domains/posting-map/area/import/PostingAreaImportService";
import { ElectionTurnoutViewModel } from "../../../domains/election/consumer/contracts/ElectionDashboardConsumerContract";
import { MunicipalityGeoBinding } from "../../../domains/posting-map/visualization/contracts/MunicipalityGeoContract";
import * as crypto from "crypto";
import * as path from "path";

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const value = (obj as any)[key];
    if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return obj;
}

export class SalesPreviewRuntime {
  private readonly adapter = new SalesPreviewAdapter();
  private readonly validator = new SalesPreviewValidator();

  constructor(
    private readonly initRuntime: DistrictInitializationRuntime
  ) {}

  /**
   * Triggers district initialization, maps output read models to SalesPreviewModel,
   * enforces deep freezing for Read-Only assurance, and runs validation gates.
   */
  public async requestDemoPreview(
    request: DistrictInitializationRequest,
    options: {
      readonly baseDir: string;
      readonly addressEntries?: readonly ImportAddressEntry[];
      readonly viewModel?: ElectionTurnoutViewModel;
      readonly geoBindings?: readonly MunicipalityGeoBinding[];
    }
  ): Promise<SalesPreviewModel> {
    // 1. Run Domain Initialization
    const initRes = await this.initRuntime.initializeDistrict(request, options);
    if (initRes.status !== "READY" && initRes.status !== "PROCESSING") {
      throw new Error(`Initialization failed: ${initRes.error ?? "unknown error"}`);
    }

    // 2. Resolve Status via Preview API
    const initPreview = this.initRuntime.getPreview(request.districtName, options.baseDir);
    
    // Generate trace identifiers for Demo Audit Tracking
    const previewId = `preview-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${request.initializationId}`;
    const traceId = crypto.randomBytes(16).toString("hex");

    // 3. Adapt models
    const rawModel = this.adapter.adapt(previewId, traceId, initPreview, options.baseDir);

    // 4. Enforce Immutability (deep freeze)
    const frozenModel = deepFreeze(rawModel);

    // 5. Validate output model
    const dashboardFile = path.join(options.baseDir, request.districtName, "dashboard.json");
    const valRes = this.validator.validate(frozenModel, dashboardFile);
    if (!valRes.success) {
      throw new Error(`Sales Preview Validation Failed: ${valRes.errors.join("; ")}`);
    }

    return frozenModel;
  }

  /**
   * Retrieves an existing SalesPreviewModel from disk read models.
   */
  public getPreview(districtName: string, baseDir: string): SalesPreviewModel {
    const initPreview = this.initRuntime.getPreview(districtName, baseDir);
    
    const previewId = `preview-get-${districtName}`;
    const traceId = crypto.randomBytes(16).toString("hex");

    const rawModel = this.adapter.adapt(previewId, traceId, initPreview, baseDir);
    const frozenModel = deepFreeze(rawModel);

    const dashboardFile = path.join(baseDir, districtName, "dashboard.json");
    const valRes = this.validator.validate(frozenModel, dashboardFile);
    if (!valRes.success) {
      throw new Error(`Sales Preview Validation Failed: ${valRes.errors.join("; ")}`);
    }

    return frozenModel;
  }
}
