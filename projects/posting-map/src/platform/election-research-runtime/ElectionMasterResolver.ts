export interface DistrictMapping {
  id: string;
  municipalities: string[];
}

export class ElectionMasterResolver {
  // 選挙区解決用マスターデータベース（モック）
  private static readonly MASTER_DATABASE: Record<string, DistrictMapping> = {
    "TOKYO-18": { id: "TOKYO-18", municipalities: ["武蔵野市", "小金井市", "西東京市"] },
    "OSAKA-06": { id: "OSAKA-06", municipalities: ["守口市", "門真市", "旭区", "鶴見区"] }
  };

  public resolveDistrict(districtName: string): DistrictMapping {
    const normalized = this.normalizeName(districtName);
    
    // マッピング検索
    if (normalized.includes("東京18") || normalized.includes("東京第18")) {
      return ElectionMasterResolver.MASTER_DATABASE["TOKYO-18"];
    } else if (normalized.includes("大阪6") || normalized.includes("大阪第6")) {
      return ElectionMasterResolver.MASTER_DATABASE["OSAKA-06"];
    }

    throw new Error(`[ElectionMasterResolver] District name '${districtName}' could not be resolved in Election Master.`);
  }

  /**
   * 表記ゆれを吸収するための正規化処理
   */
  private normalizeName(name: string): string {
    return name
      .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) // 全角英数→半角
      .replace(/十八/g, "18")
      .replace(/六/g, "6")
      .replace(/\s+/g, ""); // スペース削除
  }
}
