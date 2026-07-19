import { DistrictDataAcquisitionRequest, RawDistrictData } from "./contracts/DistrictDataAcquisitionContract";
import { DistrictDataSource } from "./contracts/DistrictDataSource";
import { DistrictDataValidator } from "./DistrictDataValidator";

export class DistrictDataAcquisitionService {
  private readonly validator = new DistrictDataValidator();

  constructor(private readonly dataSource: DistrictDataSource) {}

  /**
   * Resolves the districtName from the data source, finalizes system fields, and validates it.
   */
  public async acquire(request: DistrictDataAcquisitionRequest): Promise<RawDistrictData> {
    if (!request.districtName || request.districtName.trim() === "") {
      throw new Error("Invalid request: districtName is missing or empty.");
    }

    const rawData = await this.dataSource.resolveDistrict(request.districtName);
    if (!rawData) {
      throw new Error(`District could not be resolved from data source: '${request.districtName}'`);
    }

    // Re-verify/re-generate sourceHash to guarantee consistency
    const computedHash = this.validator.calculateSourceHash(rawData.municipalities);
    const finalizedData: RawDistrictData = {
      ...rawData,
      sourceHash: computedHash,
      acquiredAt: new Date().toISOString()
    };

    const validation = this.validator.validate(finalizedData);
    if (!validation.success) {
      throw new Error(`Validation failed for acquired district data: ${validation.errors.join("; ")}`);
    }

    return finalizedData;
  }
}
