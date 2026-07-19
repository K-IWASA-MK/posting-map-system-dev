import { MapVisualizationProjectionSchema, VisualizationMetadata, MunicipalityMapProjection } from "../contracts/PostingMapVisualizationContract";
import { deepFreeze } from "../../../election/storage/models/ElectionDashboardStorage";

export class PostingMapVisualizationProjection implements MapVisualizationProjectionSchema {
  public readonly projectionId: string;
  public readonly electionId: string;
  public readonly generatedAt: string;
  public readonly metadata: VisualizationMetadata;
  public readonly municipalities: readonly MunicipalityMapProjection[];

  constructor(
    projectionId: string,
    electionId: string,
    generatedAt: string,
    metadata: VisualizationMetadata,
    municipalities: readonly MunicipalityMapProjection[]
  ) {
    this.projectionId = projectionId;
    this.electionId = electionId;
    this.generatedAt = generatedAt;
    
    // Deep clone data to avoid reference mutation leakage
    this.metadata = JSON.parse(JSON.stringify(metadata));
    this.municipalities = JSON.parse(JSON.stringify(municipalities));

    // Recursively freeze entire object structure (including metadata and data array objects)
    deepFreeze(this);
  }

  /**
   * Serializes the model into a JSON string.
   */
  public toJSON(): string {
    return JSON.stringify({
      projectionId: this.projectionId,
      electionId: this.electionId,
      generatedAt: this.generatedAt,
      metadata: this.metadata,
      municipalities: this.municipalities
    });
  }
}
export { deepFreeze };
