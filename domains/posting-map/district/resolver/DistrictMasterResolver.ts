import { DistrictResolver, DistrictInfo } from "../../initialization/contracts/DistrictResolver";
import { DistrictMasterRepository } from "../storage/DistrictMasterRepository";

export class DistrictMasterResolver implements DistrictResolver {
  constructor(
    private readonly repository: DistrictMasterRepository,
    private readonly registryFilePath: string
  ) {}

  /**
   * Resolves the districtName to a DistrictInfo using the repository data.
   */
  public resolve(districtName: string): DistrictInfo {
    const list = this.repository.read(this.registryFilePath);
    const matched = list.find(d => d.districtName === districtName);

    if (!matched) {
      throw new Error(`Unknown or unsupported district: ${districtName}`);
    }

    return {
      districtId: matched.districtId,
      districtName: matched.districtName,
      municipalities: Object.freeze(
        matched.municipalities.map(m => ({
          code: m.municipalityCode,
          name: m.municipalityName
        }))
      )
    };
  }
}
