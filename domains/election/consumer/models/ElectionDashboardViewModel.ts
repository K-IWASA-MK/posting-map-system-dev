import {
  ElectionTurnoutViewModel,
  DistrictViewModel,
  MunicipalityViewModel
} from "../contracts/ElectionDashboardConsumerContract";

export class ElectionDashboardViewModel implements ElectionTurnoutViewModel {
  public readonly sourceType: "TURNOUT_DASHBOARD_PROJECTION" = "TURNOUT_DASHBOARD_PROJECTION";
  public readonly electionId: string;
  public readonly electionDate: string;
  public readonly nationalTurnout: number;
  public readonly districts: readonly DistrictViewModel[];
  public readonly municipalities: readonly MunicipalityViewModel[];
  public readonly lineageHash: string;
  public readonly lastUpdated: string;

  constructor(
    electionId: string,
    electionDate: string,
    nationalTurnout: number,
    districts: readonly DistrictViewModel[],
    municipalities: readonly MunicipalityViewModel[],
    lineageHash: string,
    lastUpdated: string
  ) {
    this.electionId = electionId;
    this.electionDate = electionDate;
    this.nationalTurnout = nationalTurnout;
    this.districts = districts;
    this.municipalities = municipalities;
    this.lineageHash = lineageHash;
    this.lastUpdated = lastUpdated;
  }
}
