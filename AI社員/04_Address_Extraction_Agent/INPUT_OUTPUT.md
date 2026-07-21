# Address Extraction AI - INPUT / OUTPUT Specification

Version: 2.0.0 (Single Status SSOT)

---

## ■ Input (入力)
- **正本ファイル**: `FIELD_OPERATIONS_PLATFORM/03_BRANCH/【都道府県】/【選挙区】/master/district_profile.json`
- **全国住所マスター**: プロジェクト内既存住所マスターデータベース

---

## ■ Output (出力)

### 1. `master/address_database.json` (スキーマ v2.0.0)
`hasChome` を完全廃止し、`chomeStatus` を唯一の真実 (Single Source of Truth) とした決定論的データ構造。

```json
{
  "schemaVersion": "2.0.0",
  "districtId": "MIE-03",
  "districtName": "三重第3区",
  "totalMunicipalities": 5,
  "totalTowns": 17,
  "owner": "Address Extraction AI",
  "municipalities": [
    {
      "name": "桑名市",
      "towns": [
        {
          "name": "大山田",
          "chomeStatus": "VERIFIED",
          "chome": ["1丁目", "2丁目", "3丁目"]
        },
        {
          "name": "吉之丸",
          "chomeStatus": "NONE",
          "chome": []
        }
      ]
    }
  ],
  "lastUpdated": "2026-07-21T16:34:00+09:00"
}
```

#### 丁目ステータス (`chomeStatus`) 整合性マトリクス
- `VERIFIED`: 丁目が存在し一覧が検証済み (`chome`: 1件以上必須)
- `NONE`: 丁目が存在しない町名であることが確定検証済み (`chome`: 空配列 `[]` 必須)
- `PENDING`: 未調査 (`chome`: 空配列 `[]` 必須)
- `FAILED`: 取得失敗 (`chome`: 空配列 `[]` 必須)

---

### 2. `logs/verification.json`
```json
{
  "agent": "Address Extraction AI",
  "version": "2.0.0",
  "result": "SUCCESS",
  "input": {
    "districtProfile": "master/district_profile.json"
  },
  "outputs": [
    "master/address_database.json",
    "logs/verification.json"
  ],
  "artifacts": [
    {
      "file": "master/address_database.json",
      "size": 1720,
      "sha256": "..."
    }
  ]
}
```
