export interface Municipality {
  name: string;
  code?: string;
  source?: string;
}

export interface DistrictInfo {
  id: string;
  name: string;
  municipalities: Municipality[];
}

export interface DistrictMetadata {
  district: DistrictInfo;
  createdAt: string;
}

export class DistrictMetadataHelper {
  public static create(districtName: string, municipalities: string[]): DistrictMetadata {
    // Generate simple stable ID prefix
    let prefix = "DST";
    if (districtName.includes("東京")) {
      const match = districtName.match(/\d+/);
      prefix = `TOKYO-${match ? match[0] : "UNK"}`;
    } else if (districtName.includes("大阪")) {
      const match = districtName.match(/\d+/);
      prefix = `OSAKA-${match ? match[0] : "UNK"}`;
    } else if (districtName.includes("三重")) {
      const match = districtName.match(/\d+/);
      prefix = `MIE-${match ? match[0] : "UNK"}`;
    }

    return {
      district: {
        id: prefix,
        name: districtName,
        municipalities: municipalities.map(m => ({ name: m }))
      },
      createdAt: new Date().toISOString()
    };
  }
}
