export class ResearchValidator {
  // 意思決定や配布判断に関わる禁止パラメータのリスト
  private static readonly FORBIDDEN_KEYS = [
    "distributionArea",
    "route",
    "targetHouseholds",
    "priorityArea",
    "prediction",
    "winProbability",
    "strategy",
    "recommendation"
  ];

  /**
   * コンパイルされた JSON 文字列またはオブジェクトの中に禁止キーが混入していないかを検証する
   */
  public validate(jsonObj: any): boolean {
    const rawString = JSON.stringify(jsonObj);
    
    for (const forbiddenKey of ResearchValidator.FORBIDDEN_KEYS) {
      // JSONキーまたはプロパティ名として禁止単語が存在していないかチェック
      const regex = new RegExp(`"${forbiddenKey}"\\s*:`, "i");
      if (regex.test(rawString)) {
        console.error(`[ResearchValidator] Violation: Forbidden decision-making key '${forbiddenKey}' was found in the compiled data.`);
        return false;
      }
    }

    return true;
  }
}
