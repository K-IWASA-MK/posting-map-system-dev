# Address Extraction AI - INPUT / OUTPUT Specification

Version: 2.2.0 (Data Lineage Standard Compliant)

---

## ■ Input (入力)
- **正本ファイル**: `FIELD_OPERATIONS_PLATFORM/03_BRANCH/【都道府県】/【選挙区】/master/district_profile.json`
- **全国住所マスター**: プロジェクト内既存住所マスターデータベース (`NATIONAL_ADDRESS_MASTER_v2026.07`)

---

## ■ Output (出力)

### 1. `master/address_database.json` (スキーマ v2.2.0)
Data Lineage Standard v1.0 準拠の共通血統追跡オブジェクト `lineage` を内包。

```json
{
  "schemaVersion": "2.2.0",
  "districtId": "MIE-03",
  "districtName": "三重第3区",
  "prefecture": "三重県",
  "totalMunicipalities": 5,
  "totalTowns": 17,
  "owner": "Address Extraction AI",
  "lineage": {
    "producer": "Address Extraction AI",
    "sourceArtifact": "master/district_profile.json",
    "sourceVersion": "1.0.0",
    "masterSource": "NATIONAL_ADDRESS_MASTER_v2026.07",
    "generatedAt": "2026-07-21T16:37:00+09:00",
    "schemaVersion": "2.2.0"
  },
  "municipalities": [
    {
      "name": "桑名市",
      "towns": [
        {
          "name": "大山田",
          "chomeStatus": "VERIFIED",
          "verificationSource": "NATIONAL_ADDRESS_MASTER",
          "chome": ["1丁目", "2丁目", "3丁目"]
        },
        {
          "name": "吉之丸",
          "chomeStatus": "NONE",
          "verificationSource": "NATIONAL_ADDRESS_MASTER",
          "chome": []
        }
      ]
    }
  ],
  "lastUpdated": "2026-07-21T16:37:00+09:00"
}
```

---

### 2. `logs/verification.json`
```json
{
  "agent": "Address Extraction AI",
  "version": "2.2.0",
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
      "size": 1980,
      "sha256": "..."
    }
  ]
}
```
