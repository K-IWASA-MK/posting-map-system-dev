import { DistrictMasterSchema, MunicipalityReference } from "../contracts/DistrictMasterContract";

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const value = (obj as any)[key];
    if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return obj;
}

export class DistrictMaster implements DistrictMasterSchema {
  public readonly districtId: string;
  public readonly districtName: string;
  public readonly prefecture: string;
  public readonly districtNumber: string;
  public readonly masterVersion: string;
  public readonly effectiveFrom: string;
  public readonly effectiveTo?: string;
  public readonly municipalities: readonly MunicipalityReference[];
  public readonly createdAt: string;
  public readonly updatedAt: string;
  public readonly sourceHash: string;
  public readonly contentHash: string;

  constructor(data: DistrictMasterSchema) {
    this.districtId = data.districtId;
    this.districtName = data.districtName;
    this.prefecture = data.prefecture;
    this.districtNumber = data.districtNumber;
    this.masterVersion = data.masterVersion;
    this.effectiveFrom = data.effectiveFrom;
    this.effectiveTo = data.effectiveTo;
    this.municipalities = data.municipalities;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.sourceHash = data.sourceHash;
    this.contentHash = data.contentHash;

    deepFreeze(this);
  }
}
