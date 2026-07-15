import { AreaId } from '../valueobjects/AreaId';
import { Location } from '../valueobjects/Location';

export class DistributionArea {
  public readonly areaId: AreaId;
  public readonly name: string;
  public readonly postalCodes: string[];
  public readonly boundaries: Location[];

  constructor(params: {
    areaId: AreaId;
    name: string;
    postalCodes: string[];
    boundaries: Location[];
  }) {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error("Area name cannot be empty");
    }
    this.areaId = params.areaId;
    this.name = params.name;
    this.postalCodes = [...params.postalCodes];
    this.boundaries = [...params.boundaries];
  }
}
