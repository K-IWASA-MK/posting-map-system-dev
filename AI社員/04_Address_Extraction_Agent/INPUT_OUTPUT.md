# Address Extraction AI - INPUT / OUTPUT Specification

Version: 1.1.0

---

## ■ Input (入力)
- **正本ファイル**: `FIELD_OPERATIONS_PLATFORM/03_BRANCH/【都道府県】/【選挙区】/master/district_profile.json`
- **全国住所マスター**: プロジェクト内既存住所マスターデータベース

---

## ■ Output (出力)

### 1. `master/address_database.json` (新スキーマ v1.1.0)
```json
{
  "schemaVersion": "1.1.0",
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
          "hasChome": true,
          "chomeStatus": "VERIFIED",
          "chome": ["1丁目", "2丁目", "3丁目"]
        },
        {
          "name": "吉之丸",
          "hasChome": false,
          "chomeStatus": "NONE",
          "chome": []
        }
      ]
    }
  ],
  "lastUpdated": "2026-07-21T16:32:00+09:00"
}
```

#### 丁目ステータス (`chomeStatus`) 定義
- `VERIFIED`: 丁目が存在し、一覧が検証済み (`hasChome: true`)
- `NONE`: 丁目が存在しない町名であることが確定検証済み (`hasChome: false`, `chome: []`)
- `PENDING`: 未調査
- `FAILED`: 取得失敗

---

### 2. `logs/verification.json` (監査ログ)
```json
{
  "agent": "Address Extraction AI",
  "version": "1.1.0",
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
      "size": 1850,
      "sha256": "..."
    }
  ]
}
```
