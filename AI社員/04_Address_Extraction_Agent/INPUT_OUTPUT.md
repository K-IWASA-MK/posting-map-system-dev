# Address Extraction AI - INPUT / OUTPUT Specification

Version: 1.0.0

---

## ■ Input (入力)
- **正本ファイル**: `FIELD_OPERATIONS_PLATFORM/03_BRANCH/【都道府県】/【選挙区】/master/district_profile.json`
- **全国住所マスター**: プロジェクト内既存住所マスターデータベース

---

## ■ Output (出力)

### 1. `master/address_database.json` (住所正本データ)
```json
{
  "schemaVersion": "1.0.0",
  "districtId": "MIE-03",
  "districtName": "三重第3区",
  "totalMunicipalities": 5,
  "totalAddresses": 120,
  "owner": "Address Extraction AI",
  "municipalities": [
    {
      "name": "桑名市",
      "towns": [
        { "name": "江場", "chome": ["1丁目", "2丁目", "3丁目"] },
        { "name": "吉之丸", "chome": [] }
      ]
    }
  ],
  "lastUpdated": "2026-07-21T16:20:00+09:00"
}
```

### 2. `logs/verification.json` (監査ログ)
```json
{
  "agent": "Address Extraction AI",
  "version": "1.0.0",
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
      "size": 1450,
      "sha256": "..."
    }
  ]
}
```
