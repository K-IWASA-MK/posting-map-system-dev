import { DistrictTurnoutContract } from "../contracts/TurnoutContract";

export class DistrictTurnout implements DistrictTurnoutContract {
  public readonly districtId: string;
  public readonly districtName: string;
  public readonly turnout: number;

  constructor(districtId: string, districtName: string, turnout: number) {
    this.districtId = districtId;
    this.districtName = districtName;
    this.turnout = turnout;
  }
}
