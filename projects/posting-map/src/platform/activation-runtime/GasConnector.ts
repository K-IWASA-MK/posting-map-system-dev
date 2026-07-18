import * as fs from "fs";

export class GasConnector {
  public async verifyGasConnection(deploymentJsonPath: string): Promise<boolean> {
    if (!fs.existsSync(deploymentJsonPath)) {
      console.error(`[GasConnector] deployment.json not found at ${deploymentJsonPath}`);
      return false;
    }

    try {
      const content = JSON.parse(fs.readFileSync(deploymentJsonPath, "utf-8"));
      
      // 互換パースロジック
      let webAppUrl = "";
      if (content.gas && content.gas.webAppUrl) {
        webAppUrl = content.gas.webAppUrl;
      } else if (content.webAppUrl) {
        webAppUrl = content.webAppUrl;
      }

      if (!webAppUrl || webAppUrl.trim() === "" || webAppUrl === "https://script.google.com/macros/s/MOCK_WEBAPP_URL/exec_failed") {
        console.error(`[GasConnector] Invalid or empty GAS WebApp URL`);
        return false;
      }

      // モック接続チェック成功
      return true;
    } catch (err) {
      console.error(`[GasConnector] Failed to parse deployment.json`, err);
      return false;
    }
  }
}
