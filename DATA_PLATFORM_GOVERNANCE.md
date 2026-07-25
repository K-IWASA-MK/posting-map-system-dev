# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 3.0  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS / 289 DISTRICT EXPANSION ENGINE  

---

## ■ 最重要原則: STEP 0 (危険検知) ➔ STEP 1 (境界確定) ➔ STEP 1.5 (境界証明)
```
┌─────────────────────────────────────────────────────────────┐
│ 今後289選挙区へ展開する上で、境界事故率をゼロ化するために     │
│ 【STEP 0: 危険検知】 ➔ 【STEP 1: 境界確定】 ➔ 【STEP 1.5: 境界証明】│
│ の3段階品質チェックを必須条件とする。                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ■ 8 段階不可逆データ生成フロー (Complete Execution Pipeline)

```
[STEP 0]   自治体分割リスク判定 (Municipality Split Risk Analysis)
              │
              ▼
[Gate 0]   Boundary Confirmation Gate (リスク検知通過)
              │
              ▼
[STEP 1]   選挙区境界判定 (Boundary Resolution)
              │
              ▼
[STEP 1.5] 境界証明ゲート (Boundary Evidence Gate) ★新設
           (各分割自治体の包含/除外地域プロパティ検証)
              │
              ▼
[STEP 2]   対象地域確定 (Target Area Determination & Evidence)
              │
              ▼
[STEP 3]   Address Extraction Rule v2 (住所階層抽出)
              │
              ▼
[STEP 4]   POSTING MAP エリア生成 (Area Record Generation)
              │
              ▼
[STEP 5]   郵便番号昇順ソート (Postal Code Ascending Sort)
              │
              ▼
[STEP 6]   自治体別 10件単位シート生成 (10-Record Sheet Partitioning)
```

---

## ■ STEP 1.5: Boundary Evidence Gate 構造証明

分割自治体（例: 四日市市）について、以下の証明 JSON (`boundary_evidence_gate.json`) が生成され、`boundaryVerified: true` が検証された場合のみ次工程へ進行する：

```json
{
  "district": "MIE-03",
  "municipality": "四日市市",
  "source": "行政区割りデータ (総務省・三重県選挙管理委員会基準)",
  "excludedAreas": [
    "日永", "笹川", "楠町", "内部", "塩浜", "海蔵", "三重", "桜"
  ],
  "includedAreas": [
    "富田", "富州原町", "羽津"
  ],
  "boundaryVerified": true
}
```

---

## ■ 三重第3区 (MIE-03) 最終確定分類結果

- **桑名市**: Pattern A (自治体全域 1選挙区 ✅)
- **いなべ市**: Pattern A (自治体全域 1選挙区 ✅)
- **木曽岬町**: Pattern A (自治体全域 1選挙区 ✅)
- **東員町**: Pattern A (自治体全域 1選挙区 ✅)
- **菰野町**: Pattern A (自治体全域 1選挙区 ✅)
- **朝日町**: Pattern A (自治体全域 1選挙区 ✅)
- **川越町**: Pattern A (自治体全域 1選挙区 ✅)
- **四日市市**: Pattern B (分割確認必須: 第2区除外・第3区確定 ✅)
