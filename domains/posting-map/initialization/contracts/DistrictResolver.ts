export interface DistrictInfo {
  readonly districtId: string;
  readonly districtName: string;
  readonly municipalities: readonly { readonly code: string; readonly name: string }[];
}

export interface DistrictResolver {
  resolve(districtName: string): DistrictInfo;
}

export class StaticDistrictResolver implements DistrictResolver {
  private static readonly DISTRICTS: Record<string, Omit<DistrictInfo, "districtName">> = {
    "三重県第3区": {
      districtId: "mie-03",
      municipalities: [
        { code: "24205", name: "桑名市" },
        { code: "24214", name: "いなべ市" },
        { code: "24202", name: "四日市市" }
      ]
    }
  };

  public resolve(districtName: string): DistrictInfo {
    const info = StaticDistrictResolver.DISTRICTS[districtName];
    if (!info) {
      throw new Error(`Unknown or unsupported district: ${districtName}`);
    }
    return {
      districtId: info.districtId,
      districtName,
      municipalities: info.municipalities
    };
  }
}
