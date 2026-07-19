# INPUT_OUTPUT.md - 入出力インターフェース定義 (Input/Output Interface Schema)

## ■ 入力仕様 (Input Specification)

全体統制AIから引き渡されるリクエストスキーマ：

```json
{
  "acquisitionId": "acq-saitama-08-001",
  "districtName": "埼玉県第8区",
  "requestedAt": "2026-07-19T11:20:00Z"
}
```

- **acquisitionId**: データ取得タスクを一意に識別する文字列。
- **districtName**: 日本国内の選挙区の名称（表記揺れチェック対象）。
- **requestedAt**: ISO 8601 形式の要求タイムスタンプ。

---

## ■ 出力仕様 (Output Specification / Raw District Data)

取得完了時に生成される構造化JSONスキーマ：

```json
{
  "districtId": "saitama-08",
  "districtName": "埼玉県第8区",
  "prefecture": "埼玉県",
  "districtNumber": "8",
  "municipalities": [
    {
      "municipalityCode": "11208",
      "municipalityName": "所沢市"
    },
    {
      "municipalityCode": "11245",
      "municipalityName": "ふじみ野市"
    },
    {
      "municipalityCode": "11324",
      "municipalityName": "三芳町"
    }
  ],
  "acquiredAt": "2026-07-19T11:21:00Z",
  "sourceHash": "a1b2c3d4e5f6..."
}
```

### スキーマ説明:
- **districtId**: 都道府県ローマ字と選挙区番号から成るシステム一意の識別子。
- **districtName**: 元の入力選挙区名。
- **prefecture**: 所属都道府県。
- **districtNumber**: 選挙区の数字部分。
- **municipalities**: 内包される自治体のマッピング配列。
  - `municipalityCode`: 5桁の全国地方公共団体コード。
  - `municipalityName`: 自治体名称。
- **acquiredAt**: データ取得完了のISOタイムスタンプ。
- **sourceHash**: `municipalities` 配列の内容から決定論的に生成されるソースデータのハッシュ値（改ざん防止・順序非依存）。
