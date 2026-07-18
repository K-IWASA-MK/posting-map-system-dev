import { DistrictModel, BranchStatusModel, AssetStatusModel } from "../models/InternalModels";

export class DeploymentAdapter {
  public static adaptDistrict(data: any): DistrictModel {
    return {
      id: data.district?.id || "",
      name: data.district?.name || "",
      status: data.provisioning?.status || "UNKNOWN"
    };
  }

  public static adaptBranchStatus(data: any): Partial<BranchStatusModel> {
    return {
      districtId: data.district?.id || "",
      districtName: data.district?.name || "",
      provisioningStatus: data.provisioning?.status || "UNKNOWN"
    };
  }

  public static adaptAssetStatus(data: any): Partial<AssetStatusModel> {
    const resources = data.resources || {};
    return {
      districtId: data.district?.id || "",
      spreadsheetId: resources.spreadsheetId || "",
      storageFolderId: resources.storageFolderId || "",
      scriptId: resources.scriptId || "",
      webAppUrl: resources.webAppUrl || ""
    };
  }
}
