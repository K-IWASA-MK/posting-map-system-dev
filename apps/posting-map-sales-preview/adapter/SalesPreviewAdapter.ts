import { SalesPreviewModel, TurnoutPreview, VisualizationFeature } from "../contracts/SalesPreviewContract";
import { DistrictInitializationPreview } from "../../../domains/posting-map/initialization/contracts/DistrictInitializationPreview";
import * as fs from "fs";
import * as path from "path";

export class SalesPreviewAdapter {
  /**
   * Adapts the DistrictInitializationPreview status along with read models from disk
   * to build a complete SalesPreviewModel.
   * Enforces the No Calculation Policy: directly maps colorStatus and turnout without recalculating.
   */
  public adapt(
    previewId: string,
    traceId: string,
    initPreview: DistrictInitializationPreview,
    baseDir: string
  ): SalesPreviewModel {
    const districtName = initPreview.district;
    const districtDir = path.join(baseDir, districtName);

    const areasFile = path.join(districtDir, "areas.json");
    const dashboardFile = path.join(districtDir, "dashboard.json");

    const turnoutOverview: TurnoutPreview[] = [];
    const visualizationFeatures: VisualizationFeature[] = [];

    // Parse dashboard if ready
    if (initPreview.dashboardStatus === "READY" && fs.existsSync(dashboardFile)) {
      try {
        const dashboard = JSON.parse(fs.readFileSync(dashboardFile, "utf-8"));
        const viewModel = dashboard.data;

        // 1. National Overview
        turnoutOverview.push({
          name: "全国",
          turnout: viewModel.nationalTurnout,
          colorStatus: "GREEN" // Default national status color
        });

        // 2. District Overview
        if (viewModel.districts && viewModel.districts.length > 0) {
          const dist = viewModel.districts[0];
          turnoutOverview.push({
            name: dist.name,
            turnout: dist.turnout,
            colorStatus: dist.colorStatus
          });
        }

        // 3. Municipalities Turnout and Geo Mapping
        if (viewModel.municipalities) {
          for (const m of viewModel.municipalities) {
            turnoutOverview.push({
              name: m.name,
              turnout: m.turnout,
              colorStatus: m.colorStatus
            });

            visualizationFeatures.push({
              municipalityCode: m.code,
              geometryId: `geom-${m.code}`,
              colorStatus: m.colorStatus,
              fillColor: m.colorStatus // No Calculation Policy: direct mapping
            });
          }
        }
      } catch (err) {
        console.error("[SalesPreviewAdapter] Failed to parse dashboard read model:", err);
      }
    }

    return {
      previewId,
      traceId,
      generatedAt: new Date().toISOString(),
      districtName,
      municipalities: Object.freeze([...initPreview.municipalities]),
      areaStatus: initPreview.areaStatus,
      dashboardStatus: initPreview.dashboardStatus,
      visualizationStatus: initPreview.visualizationStatus,
      turnoutOverview: Object.freeze(turnoutOverview),
      visualizationFeatures: Object.freeze(visualizationFeatures)
    };
  }
}
