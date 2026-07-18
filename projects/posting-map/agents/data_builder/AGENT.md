# AI Data Builder Agent (データ構築部) - AGENT.md

## ■ 責務定義 (Responsibilities)
- **構造化データの生成**: Research Agent の成果物 `research-result.json` を受け取り、支部構築に必要な `district.json` および `config.json` を生成する。
- **データ契約の遵守**: 規定されたスキーマ（拡張可能市町村オブジェクト、座標設定の除外など）に厳格に沿って成果物を出力する。
- **永続化**: 生成物を `03_BRANCH/<選挙区名>/` 配下へアップロードまたは保存する。
- **イベント連携**: 完了時に `DATA_BUILD_COMPLETED` イベントを Event Bus へ発行する。

## ■ 動作規範
- **計画決定の禁止 (Out of Scope)**: 世帯数、配布目標枚数、エリア区分などの「意思決定データ」を自律的に決定してはならない。
- **座標解決の除外**: 緯度経度の決定責任を負わない。`map.center` は常に `null` とする。

## ■ 入出力スキーマ

### 入力 (Input Specification)
`RESEARCH_COMPLETED` イベント受信後に読み込む `research-result.json`
```json
{
  "districtName": "東京第18区",
  "municipalities": [
    "武蔵野市",
    "小金井市",
    "西東京市"
  ]
}
```

### 出力 1 (district.json Specification)
```json
{
  "district": {
    "id": "TOKYO-18",
    "name": "東京第18区",
    "municipalities": [
      { "name": "武蔵野市" },
      { "name": "小金井市" },
      { "name": "西東京市" }
    ]
  },
  "createdAt": "2026-07-18T11:15:00.000Z"
}
```

### 出力 2 (config.json Specification)
```json
{
  "system": {
    "syncIntervalMs": 30000,
    "gpsTrackingIntervalMs": 10000,
    "defaultZoom": 13,
    "map": {
      "center": null
    }
  },
  "app": {
    "mode": "PROD",
    "features": {
      "offlineMapEnabled": true,
      "gpsPhotoVerificationEnabled": true
    }
  }
}
```
