import * as fs from "fs";

export class ActivationVerifier {
  public verifyRegistryAlignment(registryPath: string, districtId: string): boolean {
    if (!fs.existsSync(registryPath)) {
      console.error(`[ActivationVerifier] AssetRegistry.json not found at ${registryPath}`);
      return false;
    }

    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      
      // districts配下に該当IDが登録されているかチェック
      if (!registry.masters || !registry.masters.districts || !registry.masters.districts[districtId]) {
        console.error(`[ActivationVerifier] District ${districtId} not found in AssetRegistry`);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`[ActivationVerifier] Registry check failed`, err);
      return false;
    }
  }
}
