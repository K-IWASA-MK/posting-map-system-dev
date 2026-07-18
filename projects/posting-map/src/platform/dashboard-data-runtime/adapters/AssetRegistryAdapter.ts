export interface AssetRegistryInfo {
  inRegistry: boolean;
  spreadsheetId: string;
  storageFolderId: string;
  gasScriptId: string;
}

export class AssetRegistryAdapter {
  /**
   * Checks if a district is registered in AssetRegistry.json and returns its asset paths.
   */
  public static checkRegistration(data: any, districtId: string): AssetRegistryInfo {
    const districts = data?.masters?.districts || {};
    const entry = districts[districtId];
    if (entry) {
      return {
        inRegistry: true,
        spreadsheetId: entry.spreadsheetId || "",
        storageFolderId: entry.storageFolderId || "",
        gasScriptId: entry.gasScriptId || ""
      };
    }
    return {
      inRegistry: false,
      spreadsheetId: "",
      storageFolderId: "",
      gasScriptId: ""
    };
  }
}
