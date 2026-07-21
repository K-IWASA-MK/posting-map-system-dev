# Input / Output Specification: District Initialization AI

## 入力仕様 (Input Specification)

### 1. 入力パラメータ
- **型**: `string`
- **例**: `"三重第3区"` （または `"東京第18区"` など）
- **制約**: 公職選挙法に基づく正式な小選挙区名称であること。

---

## 出力仕様 (Output Specification)

本AI社員は `03_BRANCH/【都道府県】/【選挙区】/` 配下に以下の **2つの成果物** を納品する。

### 1. 構成自治体リスト CSV
- **保存先**: `03_BRANCH/【都道府県】/【選挙区】/source/district_municipalities.csv`
- **データ構造**: **1自治体 = 1行レコード（1行1レコード標準）**
- **エンコーディング**: UTF-8

#### CSVフォーマット例 (三重第3区の場合):
```csv
選挙区名,都道府県,構成自治体
三重第3区,三重県,四日市市（一部）
三重第3区,三重県,桑名市
三重第3区,三重県,いなべ市
三重第3区,三重県,桑名郡
三重第3区,三重県,員弁郡
```

---

### 2. 照合監査ログ JSON
- **保存先**: `03_BRANCH/【都道府県】/【選挙区】/logs/verification.json`
- **目的**: 監査・トレーサビリティの完全保証
- **エンコーディング**: UTF-8 (JSON Pretty Print)

#### JSONフォーマット例:
```json
{
  "district": "三重第3区",
  "prefecture": "三重県",
  "result": "SUCCESS",
  "verified": true,
  "verifiedAt": "2026-07-21T15:00:00+09:00",
  "sources": [
    {
      "name": "総務省 衆議院小選挙区区割り情報",
      "url": "https://www.soumu.go.jp/senkyo/senkyo_s/news/senkyo/shuugiin_kuwari/",
      "retrievedAt": "2026-07-21T14:59:30+09:00",
      "status": "matched"
    },
    {
      "name": "三重県選挙管理委員会 区割り告示",
      "url": "https://www.pref.mie.lg.jp/SENKAN/HP/kuwari.htm",
      "retrievedAt": "2026-07-21T14:59:45+09:00",
      "status": "matched"
    }
  ],
  "municipalityCount": 5
}
```

---

## 終了ステータス定義 (RESULT)

| ステータス | 定義 |
| :--- | :--- |
| **`SUCCESS`** | 照合成功。`district_municipalities.csv` および `verification.json` が正常生成された状態。 |
| **`FAILED`** | 照合失敗または情報不一致。成果物CSVは生成されず、安全停止した状態。 |
| **`PARTIAL`** | 部分成功（将来の複数地区一括処理用拡張ステータス。v1.0単一地区処理では非使用）。 |
