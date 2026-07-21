# Address Extraction AI - INPUT / OUTPUT Specification

Version: 2.3.0 (Artifact Standard v1.0 & Lineage v1.1 Compliant)

---

## ■ Input (入力)
- **正本ファイル**: `FIELD_OPERATIONS_PLATFORM/03_BRANCH/【都道府県】/【選挙区】/master/district_profile.json`
- **全国住所マスター**: プロジェクト内既存住所マスターデータベース (`NATIONAL_ADDRESS_MASTER_v2026.07`)

---

## ■ Output (出力)

### 1. `master/address_database.json` (スキーマ v2.3.0)
`Artifact Standard v1.0` 共通ヘッダーおよび `Data Lineage Standard v1.1` (`inputs` 配列) に完全適合。

```json
{
  "schemaVersion": "2.3.0",
  "artifactId": "MIE-03-ADDRESS-DATABASE",
  "districtId": "MIE-03",
  "districtName": "三重第3区",
  "prefecture": "三重県",
  "totalMunicipalities": 5,
  "totalTowns": 17,
  "owner": "Address Extraction AI",
  "lineage": {
    "producer": "Address Extraction AI",
    "generatedAt": "2026-07-21T16:40:00+09:00",
    "schemaVersion": "2.3.0",
    "inputs": [
      {
        "artifactId": "MIE-03-DISTRICT-PROFILE",
        "artifact": "master/district_profile.json",
        "version": "1.0.0",
        "checksum": "sha256:4f3a..."
      },
      {
        "artifactId": "NATIONAL-ADDRESS-MASTER",
        "artifact": "NATIONAL_ADDRESS_MASTER",
        "version": "2026.07",
        "checksum": "sha256:9b1c..."
      }
    ]
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
  "lastUpdated": "2026-07-21T16:40:00+09:00"
}
```

---

### 2. `logs/verification.json`
```json
{
  "agent": "Address Extraction AI",
  "version": "2.3.0",
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
      "size": 2150,
      "sha256": "..."
    }
  ]
}
```
