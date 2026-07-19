export interface TurnoutClassification {
  readonly municipalityCode: string;
  readonly municipalityName: string;
  readonly nationalTurnout: number;
  readonly districtTurnout: number;
  readonly municipalityTurnout: number;
  readonly difference: number;
  readonly classification: "GREEN" | "YELLOW" | "RED";
}
