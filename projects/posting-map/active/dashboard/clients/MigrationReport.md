# Google Drive Workspace Migration Report

* **Migration Date**: 7/18/2026, 7:19:51 PM
* **Status**: 🟢 SUCCESS

## 1. Migration Summary Statistics

* **Moved Assets**: 0
* **Registered Assets**: 7
* **Skipped Assets**: 7
* **Errors**: 0

## 2. Verification Results

| Target Component | Status | Details |
| :--- | :--- | :--- |
| Template Spreadsheet | ✅ PASS | Resolved name: "MIE-02 支部　ポスティングエリアマップ _開発用 のコピー" (ID: 14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4) |
| Template GAS (Script) | ❌ FAIL | Lookup error: Drive API Error [404]: {
  "error": {
    "code": 404,
    "message": "File not found: 158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmHh_eKHN_fR58sa.",
    "errors": [
      {
        "message": "File not found: 158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmHh_eKHN_fR58sa.",
        "domain": "global",
        "reason": "notFound",
        "location": "fileId",
        "locationType": "parameter"
      }
    ]
  }
}
 |
| Election Master | ⚠️ WARNING | No ID registered. |
| Postal Master | ⚠️ WARNING | No ID registered. |
| Reference Master | ⚠️ WARNING | No ID registered. |
| Storage Root Folder | ✅ PASS | Resolved name: "04_STORAGE" (ID: 1FyM4wCIqWJovbcsMZ6h9JKFQxhgwciGb) |
| MIE-04 Spreadsheet | ✅ PASS | Resolved name: "MIE-04 支部 ポスティングエリアマップ" (ID: 1n2xYOW_rinS-mDzVSOPz9aDmT8ihPUOri59CfMLnCsg) |
| MIE-04 Storage Folder | ✅ PASS | Resolved name: "MIE-04 支部_STORAGE" (ID: 1j45kdXmU9pj-tY7QQmjB3nvINz4zCesN) |
| MIE-05 Spreadsheet | ✅ PASS | Resolved name: "MIE-05 支部 ポスティングエリアマップ" (ID: 1nwreNCMn2f_wcBW4658xgxLyb8udUJlYXydh0dpTpLM) |
| MIE-05 Storage Folder | ✅ PASS | Resolved name: "MIE-05 支部_STORAGE" (ID: 1uoCwkEITDxoQjvVkl2G4djA34wMQS9eV) |
| posting-map-snapshot Storage Folder | ✅ PASS | Resolved name: "posting-map-snapshot" (ID: 1hjoDkBQ-q7YWuHwOZaLmqEHTlJwvcMHY) |

## 2.5. Master Reference Data Migration

* **Postal Master**: `KEN_ALL.CSV` successfully uploaded (ID: `1m6e6tH8vwBKs1HJuXAeEFCAU8wlKpSHl`)
* **Address Master**: `postal.csv` successfully uploaded (ID: `1jr272nvp4bUWh7maGfEnTKDa9qEqSbgP`)

## 3. Configured Asset Registry

```json
{
  "updatedAt": 1784369989420,
  "schemaVersion": 1,
  "templates": {
    "spreadsheetId": "14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4",
    "scriptId": "158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmHh_eKHN_fR58sa",
    "webAppUrl": "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec",
    "version": "v1",
    "projectName": "三重県第3区",
    "lastUpdated": "2026-07-18T10:19:49.420Z",
    "driveFileId": "158Avw8hAtZx-c9yW10DE0NzB1NYngwv31eroqn-IAmHh_eKHN_fR58sa"
  },
  "masters": {
    "electionSpreadsheetId": "",
    "postalCsvFileId": "",
    "referenceMasterId": ""
  },
  "dashboard": {
    "assets": []
  },
  "storage": {
    "rootFolderId": "1FyM4wCIqWJovbcsMZ6h9JKFQxhgwciGb"
  },
  "branches": [
    {
      "id": "MIE-04",
      "spreadsheetId": "1n2xYOW_rinS-mDzVSOPz9aDmT8ihPUOri59CfMLnCsg",
      "storageFolderId": "1j45kdXmU9pj-tY7QQmjB3nvINz4zCesN"
    },
    {
      "id": "MIE-05",
      "spreadsheetId": "1nwreNCMn2f_wcBW4658xgxLyb8udUJlYXydh0dpTpLM",
      "storageFolderId": "1uoCwkEITDxoQjvVkl2G4djA34wMQS9eV"
    },
    {
      "id": "posting-map-snapshot",
      "storageFolderId": "1hjoDkBQ-q7YWuHwOZaLmqEHTlJwvcMHY"
    }
  ]
}
```
