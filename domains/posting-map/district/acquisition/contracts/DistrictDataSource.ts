import { RawDistrictData, RawMunicipality } from "./DistrictDataAcquisitionContract";
import * as fs from "fs";

export interface DistrictDataSource {
  resolveDistrict(districtName: string): Promise<RawDistrictData | null>;
}

export class LocalDistrictDataSource implements DistrictDataSource {
  constructor(private readonly registryFilePath: string) {}

  public async resolveDistrict(districtName: string): Promise<RawDistrictData | null> {
    if (!fs.existsSync(this.registryFilePath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(this.registryFilePath, "utf-8");
      const registry = JSON.parse(content);
      const list: any[] = Array.isArray(registry) ? registry : (registry.districts ?? []);

      const found = list.find((d) => d.districtName === districtName);
      if (!found) {
        return null;
      }

      const municipalities: RawMunicipality[] = found.municipalities.map((m: any) => ({
        code: m.municipalityCode ?? m.code,
        name: m.municipalityName ?? m.name
      }));

      return {
        districtId: found.districtId,
        districtName: found.districtName,
        prefecture: found.prefecture,
        districtNumber: found.districtNumber,
        municipalities: Object.freeze(municipalities),
        acquiredAt: new Date().toISOString(),
        sourceHash: found.sourceHash ?? "",
        sourceType: "LOCAL_REGISTRY"
      };
    } catch {
      return null;
    }
  }
}
