import { DistrictModel, MunicipalityModel, TurnoutComparisonModel } from "../models/InternalModels";

export class ElectionResearchAdapter {
  public static adaptDistrict(data: any): DistrictModel {
    return {
      id: data.district?.id || "",
      name: data.district?.name || "",
      status: "UNKNOWN" // To be resolved/overwritten by activation status
    };
  }

  public static adaptMunicipalities(data: any): MunicipalityModel[] {
    if (!data.municipalities || !Array.isArray(data.municipalities)) {
      return [];
    }
    const districtId = data.district?.id || "";
    return data.municipalities.map((m: any) => ({
      districtId,
      name: m.name || "",
      historyCount: Array.isArray(m.electionHistory) ? m.electionHistory.length : 0
    }));
  }

  public static adaptTurnoutComparison(data: any): TurnoutComparisonModel[] {
    if (!data.municipalities || !Array.isArray(data.municipalities)) {
      return [];
    }
    const districtId = data.district?.id || "";
    const list: TurnoutComparisonModel[] = [];
    data.municipalities.forEach((m: any) => {
      const mName = m.name || "";
      if (Array.isArray(m.electionHistory)) {
        m.electionHistory.forEach((h: any) => {
          list.push({
            districtId,
            municipalityName: mName,
            type: h.type || "",
            year: typeof h.year === "number" ? h.year : 0,
            turnout: typeof h.turnout === "number" ? h.turnout : 0
          });
        });
      }
    });
    return list;
  }
}
