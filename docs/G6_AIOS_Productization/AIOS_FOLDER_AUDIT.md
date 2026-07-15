# AIOS Folder Audit

## 目的
現在の `posting-map-system` リポジトリ全体のフォルダー構成を調査し、「AIOS Core」「Project」「Shared」「Legacy」の4カテゴリに分類する。

## 現在のディレクトリ構造と分類

### 1. `apps/` -> **Project (移行対象)**
- `posting-map/`: POSTING MAP本体。第一号Projectとして `projects/posting-map/` へ移動対象。
- `hokusei-ch/`: 北勢CH関連アプリ。 `projects/hokusei-ch/` へ移動対象。
- `election-os/`: 選挙OSアプリ。 `projects/election-os/` へ移動対象。
- `templates/`: UIテンプレート等。AIOS Coreの `templates/` へ吸収または移動対象。

### 2. `tools/` -> **AIOS Core**
- Pythonスクリプト群（アーキテクチャレビュー、品質監査、CI/CDシミュレーションなど）。
- `hooks/`: Gitフック。
- `deploy/`: デプロイメントツール。
- **分類:** これらはAIOSの「思考・評価エンジン」であり、`kernel/` または `workflows/`、`tools/` などの AIOS Core として残す。

### 3. `aios/` -> **AIOS Core**
- `kernel/`, `runtime/`, `audit/` などの内部ディレクトリが含まれる。
- **分類:** 既に AIOS Core として独立が進んでおり、そのまま AIOS Root 直下へ配置（または維持）する。

### 4. `shared/` -> **Shared (分解対象)**
- `api.js`, `schema/`, `utils/` など。
- **分類:** AIOSが提供する共通ライブラリであれば AIOS Core の `runtime/` または `sdk/` へ。POSTING MAP固有のものであれば `projects/posting-map/shared/` へ移動する。

### 5. `legacy/` & `deprecated/` -> **Legacy (削除・アーカイブ対象)**
- 過去の不要なコード。AIOS製品版には含めず、削除または隔離する。

### 6. `skills/`, `docs/`, `reference/` -> **AIOS Core**
- **分類:** `skills/` はAIエージェントへの知識（Assets）。`docs/` はAIOS自体の仕様書。

### 7. ルートファイル (`.github/`, `.clasp.json`, `package.json` など)
- **分類:** AIOSそのもののインフラ管理ファイルとして AIOS Core に残す。アプリ固有の設定（clasp等）は `projects/` 配下へ移譲する。
