# ライセンス管理仕様書 (License Management Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、各テナントや支部（ブランチ）が利用するソフトウェア利用権利（License）のデータモデル、有効期限、利用可能範囲、および状態遷移ルールを規定する。

---

## ライセンスモデル (License Model)
ライセンスデータベースに保存される情報のスキーマ。

- **License ID**: 不変の一意なライセンス識別子（例: `LIC-MIE-03-2026`）。
- **Customer ID**: 顧客IDまたはテナント・ブランチ識別子（例: `MIE-03`）。
- **Plan**: 契約中のサービスプラン（例: `MIE-03 LICENSE`、`Enterprise Plan`）。
- **Scope (利用範囲)**: 地域独占の対象地区名、許可された操作ブランチ、または同時使用制限（例: `{"district": "三重県 第3区", "exclusive": true}`）。
- **Status (状態)**: ライセンスの動作状況。
- **Start Date**: ライセンスの利用開始日（ISO 8601）。
- **Expiration Date**: ライセンスの有効期限日（ISO 8601）。

---

## ライセンスステータス定義 (License Statuses)
ライセンスは、以下のいずれかの状態で決定論的に管理される。

| ライセンスステータス | 状態解説 |
|---|---|
| **Pending (保留中)** | 契約は起案されたが、決済確認や手動承認が完了していない初期状態。利用不可。 |
| **Active (有効)** | 契約および決済が正常であり、規定の利用範囲で全機能が使用可能な状態。 |
| **Suspended (一時停止)** | 支払遅延（Past Due）やポリシー違反の監査によって、一時的に利用権が停止された状態。 |
| **Expired (期限切れ)** | 設定された有効期限（Expiration Date）に達し、更新が行われなかった自然終了状態。 |
| **Cancelled (解約)** | 顧客の手動操作または解約イベントによって、明示的に契約が破棄・無効化された状態。 |

---

## ライセンスデータ構造 (License Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LicenseRecord",
  "type": "object",
  "properties": {
    "licenseId": { "type": "string" },
    "customerId": { "type": "string" },
    "plan": { "type": "string" },
    "scope": {
      "type": "object",
      "properties": {
        "district": { "type": "string" },
        "exclusive": { "type": "boolean" }
      },
      "required": ["district", "exclusive"]
    },
    "status": {
      "type": "string",
      "enum": ["Pending", "Active", "Suspended", "Expired", "Cancelled"]
    },
    "startDate": { "type": "string", "format": "date-time" },
    "expirationDate": { "type": "string", "format": "date-time" }
  },
  "required": ["licenseId", "customerId", "plan", "scope", "status", "startDate", "expirationDate"]
}
```
