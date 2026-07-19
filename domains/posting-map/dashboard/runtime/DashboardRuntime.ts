import { DashboardViewModel } from "../contracts/DashboardViewModel";
import { DashboardRuntimeEvent, DashboardRuntimeEventType } from "../contracts/DashboardRuntimeContract";
import { DashboardAdapter } from "../adapter/DashboardAdapter";
import { DashboardValidator } from "../validation/DashboardValidator";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

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

export class DashboardRuntime {
  private readonly adapter = new DashboardAdapter();
  private readonly validator = new DashboardValidator();
  private readonly subscribers = new Set<(event: DashboardRuntimeEvent) => void>();

  /**
   * Subscribes a listener to dashboard runtime events.
   */
  public subscribe(sub: (event: DashboardRuntimeEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(type: DashboardRuntimeEventType, districtName: string, error?: string): void {
    const event: DashboardRuntimeEvent = {
      type,
      districtName,
      timestamp: Date.now(),
      error
    };
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[DashboardRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Resolves the districtName to a DashboardViewModel using the local read models.
   * Performs hash integrity verification, adapts layout, deep freezes, and validates constraints.
   */
  public getDashboardView(districtName: string, baseDir: string): DashboardViewModel {
    const districtDir = path.join(baseDir, districtName);

    const dashboardFile = path.join(districtDir, "dashboard.json");
    const areasFile = path.join(districtDir, "areas.json");
    const visualizationFile = path.join(districtDir, "visualization.json");

    try {
      if (!fs.existsSync(dashboardFile)) {
        throw new Error(`Dashboard file not found: ${dashboardFile}`);
      }
      if (!fs.existsSync(areasFile)) {
        throw new Error(`Areas file not found: ${areasFile}`);
      }

      // 1. Verify File Integrity (Tampering Checks)
      if (!this.validator.verifyFileIntegrity(dashboardFile)) {
        throw new Error(`Dashboard file has been tampered with (integrity mismatch): ${dashboardFile}`);
      }
      if (!this.validator.verifyFileIntegrity(areasFile)) {
        throw new Error(`Areas file has been tampered with (integrity mismatch): ${areasFile}`);
      }
      if (fs.existsSync(visualizationFile) && !this.validator.verifyFileIntegrity(visualizationFile)) {
        throw new Error(`Visualization file has been tampered with (integrity mismatch): ${visualizationFile}`);
      }

      // 2. Load and Parse Files
      const dashboardData = JSON.parse(fs.readFileSync(dashboardFile, "utf-8"));
      const areasData = JSON.parse(fs.readFileSync(areasFile, "utf-8"));
      const visualizationData = fs.existsSync(visualizationFile)
        ? JSON.parse(fs.readFileSync(visualizationFile, "utf-8"))
        : undefined;

      const districtId = dashboardData.data.districts?.[0]?.id ?? "unknown";

      // 3. Adapt structure
      const rawModel = this.adapter.adapt(districtId, districtName, dashboardData, areasData, visualizationData);

      // 4. Calculate contentHash of the generated model
      const finalJson = JSON.stringify(rawModel);
      const contentHash = crypto
        .createHash("sha256")
        .update(finalJson)
        .digest("hex");

      const modelWithHash: DashboardViewModel = {
        ...rawModel,
        contentHash
      };

      // 5. Deep Freeze to enforce read-only boundary
      const frozenModel = deepFreeze(modelWithHash);

      // 6. Validate integration constraints
      const valRes = this.validator.validate(frozenModel);
      if (!valRes.success) {
        throw new Error(`Dashboard Validation Failed: ${valRes.errors.join("; ")}`);
      }

      this.emit("DASHBOARD_VIEW_LOADED", districtName);
      return frozenModel;

    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this.emit("DASHBOARD_VIEW_FAILED", districtName, errorMsg);
      throw err;
    }
  }
}
