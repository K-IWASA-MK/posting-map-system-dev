# AIOS Core Boundary Definition

## 目的
AIOS Core が持つべき責務と、Project が持つべき責務の境界（Boundary）を厳格に定義し、分離する。

## 1. AIOS Core へ残すもの (AIOS Platform)
- **AIエージェントの思考エンジンと基盤:** `tools/` のPythonスクリプト群（品質監査、アーキテクチャレビュー）。
- **ガバナンスとルール:** `AGENTS.md` (AIOSルート用)、コード規約。
- **汎用アセット (Knowledge Elevation済みのもの):**
  - **Plugins:** アプリケーションに依存しないモジュール。
  - **Skills:** AIへの命令セット。
  - **Templates:** プロジェクトの雛形。
  - **Workflows:** デプロイやCI/CDの汎用プロセス。
  - **Knowledge:** ドメイン非依存の解決録。
- **CLI/Runtime:** AIOSを操作・起動するためのコマンドやスクリプト。

## 2. Project へ移動するもの (Applications)
- **ビジネスロジック:** 桑名市、配布員、地図、保管場所などの特定の業務概念。
- **アプリケーションUI:** HTML/CSS/JS、コンポーネント。
- **データベーススキーマ:** スプレッドシートの構造定義、データ操作ロジック（GASの特定のdoGet/doPost）。
- **プロジェクト固有設定:** `.clasp.json` (デプロイ先ID)、特定の環境変数。

## 3. Shared の分解方針
現在 `shared/` にあるものは、「AIOSが提供する汎用SDK」なのか、「全アプリ共通のビジネスロジック」なのかで分ける。
- 汎用SDK → `AIOS/sdk/` または `AIOS/runtime/`
- ビジネス共通 → `projects/shared/` または各Project内

## 4. 削除・隔離候補 (Legacy)
- `legacy/`, `deprecated/` ディレクトリ。
- 未使用の古いテストスクリプトや、実証実験が終わって昇格されなかった残骸コード。

## 5. 境界のルール (Boundary Constraints)
- **依存の方向:** `Project` は `AIOS Core` に依存してよい。しかし、`AIOS Core` は `Project` に依存してはならない（ビジネスロジックを持たない）。
- **AIOSの製品性:** `projects/` を空にしても、AIOS自体は「エラーなく起動し、次の開発を待てる状態」でなければならない。
