# 投票率データスキーマ仕様書 (Turnout Data Schema Specification)

## 概要 (Overview)
本仕様書は、AIOS API およびデータアダプターから提供される、投票率表示用の Props 入力スキーマ構造を定義する。

---

## データ構造定義 (Data Schema JSON)
投票率データは以下の JSON スキーマ形式でアダプターによって正規化され、コンポーネントへ引き渡される。

```json
{
  "turnout": {
    "overall": 54.2,
    "updatedAt": "2026-07-07T22:45:10Z",
    "cities": [
      {
        "city": "津市",
        "turnoutRate": 52.8,
        "status": "Stable"
      },
      {
        "city": "四日市市",
        "turnoutRate": 55.4,
        "status": "Active"
      },
      {
        "city": "鈴鹿市",
        "turnoutRate": 51.5,
        "status": "Stable"
      }
    ]
  }
}
```

---

## 属性ルールとアサーション (Data Fields Assertion)
- **overall (number)**:
  - 地区全体の平均投票率（%）。コンポーネント側で `cities` 配列の平均値を再計算して算出してはならない。
- **city (string)**:
  - 対象市区町村の表示名称。
- **turnoutRate (number)**:
  - 各市区町村別の投票率実績値（%）。
- **status (string)**:
  - 該当地区の稼働安定度ラベル（例: `Active`, `Stable`）。
- **updatedAt (string)**:
  - API が取得されたタイムスタンプ文字列。
