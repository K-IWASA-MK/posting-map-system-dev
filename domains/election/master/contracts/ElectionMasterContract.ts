import {
  NationalTurnoutContract,
  DistrictTurnoutContract,
  MunicipalityTurnoutContract
} from "./TurnoutContract";

export interface ElectionMasterSchema {
  readonly electionId: string;
  readonly electionType: string;
  readonly electionDate: string;
  readonly nationalTurnout: NationalTurnoutContract;
  readonly districts: readonly DistrictTurnoutContract[];
  readonly municipalities: readonly MunicipalityTurnoutContract[];
}
