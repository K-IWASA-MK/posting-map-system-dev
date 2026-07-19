import {
  TurnoutDashboardProjectionSchema,
  TurnoutDistrictProjection,
  TurnoutMunicipalityProjection,
  ProjectionLineage
} from "../contracts/TurnoutDashboardProjectionContract";

export class TurnoutDashboardProjection implements TurnoutDashboardProjectionSchema {
  public readonly electionId: string;
  public readonly electionType: string;
  public readonly electionDate: string;
  public readonly nationalTurnout: number;
  public readonly districts: readonly TurnoutDistrictProjection[];
  public readonly municipalities: readonly TurnoutMunicipalityProjection[];
  public readonly lineage: ProjectionLineage;

  constructor(
    electionId: string,
    electionType: string,
    electionDate: string,
    nationalTurnout: number,
    districts: readonly TurnoutDistrictProjection[],
    municipalities: readonly TurnoutMunicipalityProjection[],
    lineage: ProjectionLineage
  ) {
    this.electionId = electionId;
    this.electionType = electionType;
    this.electionDate = electionDate;
    this.nationalTurnout = nationalTurnout;
    this.districts = districts;
    this.municipalities = municipalities;
    this.lineage = lineage;
  }
}
