# IRenderer Interface & Complete Rendering Contract Specification v1.0

---

## ■ Extended RENDERING_CONTRACT.json Specification
```json
{
  "contractId": "RC-MIE03-SPREADSHEET-001",
  "targetRenderer": "GoogleSheetsRenderer",
  "version": "1.0.0",
  "layouts": {
    "columnWidths": { "A": 450, "B": 60, "C": 250, "D": 60, "E": 180, "F": 120, "G": 220 },
    "rowHeights": { "header": 50, "data": 85 },
    "hiddenColumns": { "start": 8, "count": 10 }
  },
  "styles": {
    "header": { "background": "#1a237e", "fontColor": "#ffffff", "fontSize": 14, "bold": true },
    "dataPrimary": { "background": "#f8f9fa", "fontSize": 18, "bold": true },
    "dataSecondary": { "background": "#ffffff", "fontSize": 14, "bold": true }
  },
  "mappings": [
    {
      "sheet": "Summary",
      "cell": "B2",
      "source": "master/district_profile.json",
      "field": "districtName",
      "label": "選挙区名"
    },
    {
      "sheet": "Summary",
      "cell": "B4",
      "source": "master/address_database.json",
      "field": "totalMunicipalities",
      "label": "構成自治体数"
    },
    {
      "sheet": "Summary",
      "cell": "B5",
      "source": "master/address_database.json",
      "field": "totalTowns",
      "label": "総町名数"
    },
    {
      "sheet": "Addresses",
      "table": "towns",
      "source": "master/address_database.json",
      "field": "municipalities",
      "columns": [
        { "header": "自治体名", "key": "municipalityName" },
        { "header": "町名", "key": "townName" },
        { "header": "丁目状態", "key": "chomeStatus" },
        { "header": "検証ソース", "key": "verificationSource" }
      ]
    }
  ]
}
```

---

## ■ IRenderer Interface Methods
- `open(destination)`
- `renderCell(sheetName, cellAddress, value, styleConfig)`
- `renderTable(sheetName, startCell, tableData, headerStyleConfig, dataStyleConfig)`
- `applyLayout(sheetName, layoutConfig)`
- `flush()`
