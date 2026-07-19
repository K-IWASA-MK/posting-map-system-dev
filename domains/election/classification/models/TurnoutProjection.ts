export class TurnoutProjection {
  public readonly municipalityCode: string;
  public readonly municipalityName: string;
  public readonly turnout: number;
  public readonly national: number;
  public readonly difference: number;
  public readonly status: "GREEN" | "YELLOW" | "RED";

  constructor(
    municipalityCode: string,
    municipalityName: string,
    turnout: number,
    national: number,
    difference: number,
    status: "GREEN" | "YELLOW" | "RED"
  ) {
    this.municipalityCode = municipalityCode;
    this.municipalityName = municipalityName;
    this.turnout = turnout;
    this.national = national;
    this.difference = difference;
    this.status = status;
  }
}
