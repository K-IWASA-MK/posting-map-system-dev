import * as crypto from "crypto";
import { ElectionMasterSchema } from "../../master/contracts/ElectionMasterContract";
import { TurnoutDashboardProjection } from "../models/TurnoutDashboardProjection";
import { TurnoutDistrictProjection, TurnoutMunicipalityProjection, ProjectionLineage } from "../contracts/TurnoutDashboardProjectionContract";
import { TurnoutClassificationEngine } from "../../classification/engine/TurnoutClassificationEngine";
import { CLASSIFICATION_THRESHOLD } from "../../classification/rules/TurnoutClassificationRule";

export class TurnoutDashboardProjectionEngine {
  private readonly classificationEngine = new TurnoutClassificationEngine();

  /**
   * Deterministically projects Election Master SSOT and classification details
   * into a final Dashboard Projection Read Model.
   */
  public project(master: ElectionMasterSchema): TurnoutDashboardProjection {
    const national = master.nationalTurnout.turnout;

    // Map municipalityCode to districtId from master
    const muniDistrictMap = new Map<string, string>();
    for (const m of master.municipalities) {
      muniDistrictMap.set(m.municipalityCode, m.districtId);
    }

    // 1. Calculate municipality projections using TurnoutClassificationEngine
    const classifications = this.classificationEngine.classify(master);
    const municipalities: TurnoutMunicipalityProjection[] = classifications.map(c => ({
      municipalityCode: c.municipalityCode,
      municipalityName: c.municipalityName,
      districtId: muniDistrictMap.get(c.municipalityCode) ?? "",
      turnout: c.municipalityTurnout,
      national: c.nationalTurnout,
      difference: c.difference,
      status: c.classification
    }));

    // 2. Build district projections with extended comparison attributes
    const districts: TurnoutDistrictProjection[] = master.districts.map(d => {
      const difference = parseFloat((d.turnout - national).toFixed(2));
      let status: "GREEN" | "YELLOW" | "RED" = "YELLOW";

      if (difference >= CLASSIFICATION_THRESHOLD.GREEN) {
        status = "GREEN";
      } else if (difference <= CLASSIFICATION_THRESHOLD.RED) {
        status = "RED";
      }

      return {
        districtId: d.districtId,
        districtName: d.districtName,
        turnout: d.turnout,
        nationalTurnout: national,
        difference,
        status
      };
    });

    // 3. Compute deterministic lineage tracking hash from source JSON
    const sourceSerialized = JSON.stringify({
      electionId: master.electionId,
      electionType: master.electionType,
      electionDate: master.electionDate,
      nationalTurnout: master.nationalTurnout,
      districts: master.districts,
      municipalities: master.municipalities
    });

    const hash = crypto
      .createHash("sha256")
      .update(sourceSerialized)
      .digest("hex");

    const lineage: ProjectionLineage = {
      source: "ElectionMaster",
      classification: "TurnoutClassification",
      generatedAt: new Date().toISOString(),
      hash
    };

    return new TurnoutDashboardProjection(
      master.electionId,
      master.electionType,
      master.electionDate,
      national,
      districts,
      municipalities,
      lineage
    );
  }
}
