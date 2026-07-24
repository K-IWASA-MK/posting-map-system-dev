# POSTING MAP 住所抽出規範 (ADDRESS_EXTRACTION_RULE.md)

Version: 2.0  
Author: 岩佐CEO  

---

## ■ 最重要順序: STEP 0 分割リスク判定 ➔ Boundary Confirmation Gate ➔ 住所抽出

住所抽出は絶対に入口処理ではない。以下の確定ステップを経由した地域に対してのみ実行する。

```
[STEP 0] 自治体分割リスク判定 (Municipality Split Risk Analysis)
           │
           ▼
[Gate]   Boundary Confirmation Gate (合格確認)
           │
           ▼
[STEP 1] 選挙区境界判定 (Boundary Resolution)
           │
           ▼
[STEP 2] 対象地域確定 (Target Area Determination)
           │
           ▼
[STEP 3] 住所階層抽出 (Address Hierarchy Extraction)
```

---

## ■ パターン別抽出ルール

### 1. パターン A (自治体全域 1 選挙区)
- **対象自治体**: 桑名市, いなべ市, 木曽岬町, 東員町, 菰野町, 朝日町, 川越町
- **抽出ルール**: $\text{エリア名} = \text{自治体名} + \text{直下住所階層1つ}$

### 2. パターン B (自治体分割・複数選挙区跨り)
- **対象自治体**: 四日市市
- **抽出ルール**:
  1. 四日市市全域を取得
  2. 三重第2区所属地域 (日永, 笹川, 楠町, 内部, 塩浜, 海蔵, 三重, 桜等) を除外
  3. 残留した三重第3区所属地域 (富田1〜3丁目, 富州原町, 羽津1〜2丁目等) を確定
  4. 確定地域のみ住所階層抽出を実行
