import { MunicipalityTurnoutContract } from "../contracts/TurnoutContract";

export class MunicipalityTurnout implements MunicipalityTurnoutContract {
  public readonly municipalityCode: string;
  public readonly municipalityName: string;
  public readonly districtId: string;
  public readonly turnout: number;

  constructor(
    municipalityCode: string,
    municipalityName: string,
    districtId: string,
    turnout: number
  ) {
    this.municipalityCode = municipalityCode;
    this.municipalityName = municipalityName;
    this.districtId = districtId;
    this.turnout = turnout;
  }
}
