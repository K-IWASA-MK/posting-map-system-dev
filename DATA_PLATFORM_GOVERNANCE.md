# POSTING MAP Data Platform 基本原則 & ガバナンス規範書 (DATA_PLATFORM_GOVERNANCE.md)

Version: 1.0  
Author: 岩佐CEO  
System: POSTING MAP / FIELD OPERATIONS OS  

---

## ■ 最重要原則: 境界判定と住所抽出の完全分離
```
┌─────────────────────────────────────────────────────────────┐
│ 住所階層ルール ≠ 選挙区境界ルール                             │
│ この2つを同一ロジックで処理することを厳格に禁止する。       │
└─────────────────────────────────────────────────────────────┘
```

今回のデータプラットフォームにおける最大の修正ポイントは、「住所抽出エンジン」の問題ではなく、**「境界判定 (Boundary Resolution)」と「住所階層抽出 (Address Hierarchy Extraction)」を同じ工程として扱っていたこと**にあります。

これらを分離し、**「境界判定が先、住所抽出が後」** の不可逆 6 段階パイプラインとして固定・強制します。

---

## ■ 6 段階固定処理パイプライン (Fixed Execution Pipeline)

```
[STEP 1] 選挙区境界判定 (Boundary Resolution)
            │
            ▼
[STEP 2] 対象地域確定 (Target Area Determination & Evidence)
            │
            ▼
[STEP 3] 住所階層抽出 (Address Hierarchy Extraction)
            │
            ▼
[STEP 4] POSTING MAP エリア生成 (Area Record Generation)
            │
            ▼
[STEP 5] 郵便番号昇順ソート (Postal Code Ascending Sort)
            │
            ▼
[STEP 6] 10件単位シート生成 (10-Record Sheet Partitioning)
```

---

## ■ 各ステップの責務とルール

### 1. 選挙区境界ルール (Boundary Resolution)
- **目的**: 「その住所が対象選挙区に属するか」を判定する。
- **担当モジュール**: `DistrictBoundaryResolver`
- **入力**: 行政区割りデータ（総務省/選挙管理委員会公表データ）、選挙区境界情報、自治体境界情報
- **出力**: 選挙区対象地域一覧（例: `MIE-03` 対象地域リスト）

### 2. 住所階層ルール (Address Hierarchy Extraction)
- **目的**: 「対象地域内を POSTING MAP の 1 エリア単位に分割する」
- **担当モジュール**: `AddressHierarchyExtractor`
- **通常自治体ルール**:
  ```
  自治体 + 直下住所階層 1つ で終了
  
  (例) 桑名市 └ 江場 └ 1丁目 ➔ 「桑名市江場」
  ```

### 3. 四日市市 特別ルール (Yokkaichi Special Boundary Rule)
四日市市は **通常処理を絶対禁止** とする（1つの自治体内に複数小選挙区が混在するため）。

```
四日市市 全域
    │
    ▼
三重第2区 所属地域を除外 (日永・笹川・楠町・内部・塩浜・海蔵・三重・桜等)
    │
    ▼
三重第3区 対象地域確定 (富田1〜3丁目, 富州原町, 羽津1〜2丁目等)
    │
    ▼
住所階層抽出
```
➔ **四日市市においては Boundary Resolution (境界判定) を必ず最初に行う。**

---

## ■ 3 大絶対禁止事項 (Strict Prohibitions)

### ❌ 禁止事項 1: 自治体名だけでの判断
- 自治体名のみで一括判定することを禁止する。
- (ダメな例: `四日市市 ➔ 全部 MIE-03`)

### ❌ 禁止事項 2: 住所階層抽出後の選挙区判定
- 住所を取得してから後から選挙区を逆判定することを禁止する。
- (ダメな例: `住所全取得 ➔ 後から選挙区フィルタリング`)

### ❌ 禁止事項 3: 件数合わせによる補正
- あらかじめ決めた件数（例: 651件）に合わせるための恣意的なデータ増減・カットを禁止する。
- (ダメな例: `651件になるよう辻褄合わせのデータ調整`)

---

## ■ AI 社員 (Agent) 実行手順規範

District Initialization Agent および全データ開発 AI 社員は、必ず以下の手順を厳格に順守して実行しなければならない：

1. **`DistrictBoundaryResolver` の実行**
2. **`Boundary Evidence` (境界証明 JSON) の生成**
3. **対象地域の確定**
4. **`AddressHierarchyExtractor` の実行**
5. **`Area CSV` (`MIE-03_FINAL_VERIFIED_AREAS.csv`) の生成**
6. **`Accuracy Verification` の実行**
