import { TurnoutClassification as ITurnoutClassification } from "../contracts/TurnoutClassificationContract";

export class TurnoutClassification implements ITurnoutClassification {
  public readonly municipalityCode: string;
  public readonly municipalityName: string;
  public readonly nationalTurnout: number;
  public readonly districtTurnout: number;
  public readonly municipalityTurnout: number;
  public readonly difference: number;
  public readonly classification: "GREEN" | "YELLOW" | "RED";

  constructor(
    municipalityCode: string,
    municipalityName: string,
    nationalTurnout: number,
    districtTurnout: number,
    municipalityTurnout: number,
    difference: number,
    classification: "GREEN" | "YELLOW" | "RED"
  ) {
    this.municipalityCode = municipalityCode;
    this.municipalityName = municipalityName;
    this.nationalTurnout = nationalTurnout;
    this.districtTurnout = districtTurnout;
    this.municipalityTurnout = municipalityTurnout;
    this.difference = difference;
    this.classification = classification;
  }
}
