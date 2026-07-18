export interface NationalTurnoutContract {
  readonly level: "NATIONAL";
  readonly turnout: number;
}

export interface DistrictTurnoutContract {
  readonly districtId: string;
  readonly districtName: string;
  readonly turnout: number;
}

export interface MunicipalityTurnoutContract {
  readonly municipalityCode: string;
  readonly municipalityName: string;
  readonly districtId: string;
  readonly turnout: number;
}
