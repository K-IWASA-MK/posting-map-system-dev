import { DistrictModel, BranchStatusModel } from "../models/InternalModels";

export class ActivationAdapter {
  public static adaptDistrict(data: any): DistrictModel {
    return {
      id: data.district?.id || "",
      name: data.district?.name || "",
      status: data.status || "INACTIVE"
    };
  }

  public static adaptBranchStatus(data: any): Partial<BranchStatusModel> {
    const checks = data.checks || {};
    return {
      districtId: data.district?.id || "",
      districtName: data.district?.name || "",
      activationStatus: data.status || "INACTIVE",
      activatedAt: typeof data.activatedAt === "number" ? data.activatedAt : 0,
      lineCheck: checks.line?.status || "FAIL",
      gasCheck: checks.gas?.status || "FAIL"
    };
  }
}
