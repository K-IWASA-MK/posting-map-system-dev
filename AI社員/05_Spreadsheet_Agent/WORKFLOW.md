# AI-0003 Spreadsheet AI - WORKFLOW & Execution Flow

---

## ■ Execution Workflow

```
[ Task Received ] 
        │
        ▼
[ Read Master Artifacts ] ──► Read master/district_profile.json
                          ──► Read master/address_database.json (totalMunicipalities, totalTowns 等)
        │
        ▼
[ Pure Data Binding ] ──► 正本ヘッダー・集計値をそのまま保持（再計算なし）
        │
        ▼
[ Layout & Style Injection ] ──► セル配置・デザインシステム適用・フォーマット
        │
        ▼
[ Output Generation ] ──► output/district_summary.csv 生成
        │
        ▼
[ Finalize & Report ] ──► Execution Runtime / Execution Ledger 記録
```
