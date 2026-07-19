import { TurnoutDashboardProjectionSchema } from "../../projection/contracts/TurnoutDashboardProjectionContract";
import { ElectionDashboardViewModel } from "../models/ElectionDashboardViewModel";
import { DistrictViewModel, MunicipalityViewModel } from "../contracts/ElectionDashboardConsumerContract";

export class ElectionDashboardConsumerAdapter {
  /**
   * Safe, type-safe adaptation of a read-only projection model to a bindable UI ViewModel.
   * Ensures no classification logic is evaluated locally; status fields are copied directly.
   */
  public adapt(projection: TurnoutDashboardProjectionSchema): ElectionDashboardViewModel {
    const districts: DistrictViewModel[] = projection.districts.map(d => ({
      id: d.districtId,
      name: d.districtName,
      turnout: d.turnout,
      difference: d.difference,
      colorStatus: d.status
    }));

    const municipalities: MunicipalityViewModel[] = projection.municipalities.map(m => ({
      code: m.municipalityCode,
      name: m.municipalityName,
      districtId: m.districtId,
      turnout: m.turnout,
      national: m.national,
      difference: m.difference,
      colorStatus: m.status
    }));

    return new ElectionDashboardViewModel(
      projection.electionId,
      projection.electionDate,
      projection.nationalTurnout,
      districts,
      municipalities,
      projection.lineage?.hash ?? "",
      projection.lineage?.generatedAt ?? ""
    );
  }
}
