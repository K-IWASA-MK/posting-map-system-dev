export interface NormalizationResult {
  query: string;
  removedTokens: string[];
  original: string;
}

export class AddressQueryNormalizer {
  /**
   * Cleans internal POSTING MAP area strings from address components to create a valid Google Maps query.
   */
  public normalizeAddressQuery(record: { prefecture: string; city: string; town: string }): NormalizationResult {
    let rawCity = record.city || "";
    let rawTown = record.town || "";
    const original = `${rawCity}${rawTown}`;
    const removedTokens: string[] = [];

    // 1. Remove （一部）
    if (rawCity.includes("（一部）")) {
      rawCity = rawCity.replace("（一部）", "");
      removedTokens.push("（一部）");
    }

    // 2. Remove 第X区画
    const areaPattern = /第\d+区画/g;
    const matchArea = rawTown.match(areaPattern);
    if (matchArea) {
      matchArea.forEach(token => removedTokens.push(token));
      rawTown = rawTown.replace(areaPattern, "").trim();
    }

    // 3. (Optional) other internal tokens like "エリア", "区域", "区画" if they are not part of the address.
    // The user instructed: "ただし町名に存在する場合は禁止。住所辞書との照合を優先する。"
    // For now, we only aggressively remove the known synthetic tokens.

    const query = `${record.prefecture || ""}${rawCity}${rawTown}`.trim();

    return {
      query,
      removedTokens,
      original
    };
  }
}
