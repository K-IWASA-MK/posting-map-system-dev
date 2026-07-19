import * as crypto from "crypto";
import { ElectionDashboardStorageSchema } from "../../../election/storage/contracts/ElectionDashboardStorageContract";
import { MunicipalityGeoBinding } from "../contracts/MunicipalityGeoContract";
import { PostingMapVisualizationProjection } from "../models/PostingMapVisualizationProjection";
import { MunicipalityMapProjection, VisualizationMetadata } from "../contracts/PostingMapVisualizationContract";

export class PostingMapVisualizationProjectionEngine {
  /**
   * Translates ElectionDashboardStorage (Read Model) into a Geo-bound PostingMapVisualizationProjection.
   * Enforces Color Preservation (no color evaluation locally) and decouples Geo Boundary polygons.
   */
  public generate(
    projectionId: string,
    storage: ElectionDashboardStorageSchema,
    geoBindings: readonly MunicipalityGeoBinding[]
  ): PostingMapVisualizationProjection {
    const sourceContentHash = storage.metadata?.contentHash || "";
    const generatedAt = new Date().toISOString();

    const municipalities: MunicipalityMapProjection[] = storage.data.municipalities.map(m => {
      const binding = geoBindings.find(b => b.municipalityCode === m.code);
      const geometryId = binding ? binding.geometryId : "";

      return {
        municipalityCode: m.code,
        municipalityName: m.name,
        districtId: m.districtId,
        turnout: m.turnout,
        difference: m.difference,
        colorStatus: m.colorStatus,
        fillColor: m.colorStatus, // Direct mapping (Color Preservation)
        geometryId
      };
    });

    // Compute visualizationHash of the compiled visual dataset
    const datasetString = JSON.stringify(municipalities);
    const visualizationHash = crypto
      .createHash("sha256")
      .update(datasetString)
      .digest("hex");

    const metadata: VisualizationMetadata = {
      sourceContentHash,
      visualizationHash,
      generatedAt
    };

    return new PostingMapVisualizationProjection(
      projectionId,
      storage.electionId,
      generatedAt,
      metadata,
      municipalities
    );
  }
}
