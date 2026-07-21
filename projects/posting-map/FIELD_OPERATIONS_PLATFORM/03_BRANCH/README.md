# 03_BRANCH

## 役割
各支部の個別運用データおよび設定マニフェストを管理する領域。

## Google Drive 同期保存ルール (必修)
- **Google Drive ルートフォルダ**: `FIELD_OPERATIONS_PLATFORM`
- **フォルダ ID**: `1FfcVEQjod--rZSucOPFJD2DJ58hV650_`
- **URL**: `https://drive.google.com/drive/folders/1FfcVEQjod--rZSucOPFJD2DJ58hV650_`
- **同期待遇**: 本領域で作成されるすべての支部データ (`MIE-03` 等) は、上記 Google Drive 内の `03_BRANCH` フォルダとも完全同期保存される。

## 構造ルール (Phase 1-1 確定ルール)
- 二重管理を廃止し、すべての支部は**支部ID（例: `MIE-03`）を唯一のフォルダ名**として管理する。
- 地域名によるネストフォルダ（例: `三重県/三重第3区`）は使用せず、`MIE-03` の直下に集約する。

```
FIELD_OPERATIONS_PLATFORM/03_BRANCH/
└── MIE-03/
    └── deployment.json
```

## 識別キーと表示名ルール
- **シート名（システム用キー）**: `MIE-03 v1`
  - GAS API、データ参照、内部処理で使用するキー（Rule-004 規定: `[支部コード] v[MASTERMajor世代]`）。
- **表示名（ユーザーUI用）**: `三重第3支部`
  - ダッシュボード画面表示、PDFタイトル、LINE通知、AI社員の会話メッセージ等で使用する表示名。

---

## 🔒 支部不変性＆移行ガバナンス (Rule-005)

### 1. 支部ファイルの永久不変性 (Branch File Immutability)
* 各支部のスプレッドシートおよび運用ファイル（例: `MIE-03 v1`）は、運用実績の蓄積用として永久に上書き改変・構造変更を行わない。
* 過去の配布ログ、活動実績データ、照合結果はそのまま保管され、永続的な再現性・監査性を保持する。

### 2. 有償移行プロトコル (Upgrade Migration Protocol)
* 新しい MASTER（例: `MASTER v2`）の新機能・新レイアウトを利用する場合、既存環境を直接改変するのではなく、新環境（例: `MIE-03 v2`）として別体生成しデータ移行サービス（有償アップグレード）を行う。

```
MIE-03 v1   <-- 実績保持・過去参照用 (Immutable)
    │
    └─ (Upgrade Migration Service)
          ↓
MIE-03 v2   <-- 最新 MASTER v2 ベースの新運用環境
```
