import { ElectionMasterSchema } from "../../master/contracts/ElectionMasterContract";
import { TurnoutClassification } from "../models/TurnoutClassification";
import { TurnoutProjection } from "../models/TurnoutProjection";
import { CLASSIFICATION_THRESHOLD } from "../rules/TurnoutClassificationRule";

export class TurnoutClassificationEngine {
  /**
   * Deterministically classifies election turnout data into GREEN / YELLOW / RED status.
   */
  public classify(master: ElectionMasterSchema): TurnoutClassification[] {
    const national = master.nationalTurnout.turnout;
    const classifications: TurnoutClassification[] = [];

    // Map districts for quick lookup
    const districtMap = new Map<string, number>();
    for (const d of master.districts) {
      districtMap.set(d.districtId, d.turnout);
    }

    for (const m of master.municipalities) {
      const difference = parseFloat((m.turnout - national).toFixed(2));
      const districtTurnout = districtMap.get(m.districtId) ?? 0;

      let classification: "GREEN" | "YELLOW" | "RED" = "YELLOW";
      if (difference >= CLASSIFICATION_THRESHOLD.GREEN) {
        classification = "GREEN";
      } else if (difference <= CLASSIFICATION_THRESHOLD.RED) {
        classification = "RED";
      }

      classifications.push(
        new TurnoutClassification(
          m.municipalityCode,
          m.municipalityName,
          national,
          districtTurnout,
          m.turnout,
          difference,
          classification
        )
      );
    }

    return classifications;
  }

  /**
   * Transforms classification results into presentation projections.
   */
  public project(master: ElectionMasterSchema): TurnoutProjection[] {
    const classifications = this.classify(master);
    return classifications.map(
      c =>
        new TurnoutProjection(
          c.municipalityCode,
          c.municipalityName,
          c.municipalityTurnout,
          c.nationalTurnout,
          c.difference,
          c.classification
        )
    );
  }
}
