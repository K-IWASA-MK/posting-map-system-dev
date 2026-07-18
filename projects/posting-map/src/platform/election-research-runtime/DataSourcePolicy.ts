export interface ElectionDataSourcePolicy {
  primarySources: string[];
  fallbackBehavior: "EMPTY_ARRAY";
  allowInference: false;
}

export const DataSourcePolicy: ElectionDataSourcePolicy = {
  primarySources: ["公開選挙管理委員会データ", "自治体公開選挙結果"],
  fallbackBehavior: "EMPTY_ARRAY",
  allowInference: false
};
