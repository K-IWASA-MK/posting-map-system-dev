# Project Migration Plan (POSTING MAP)

## 目的
POSTING MAPを AIOS の第一号公式プロジェクトとして `projects/posting-map/` へ安全に移行するための詳細手順を設計する。

## 1. 移動対象 (Targets)
- `apps/posting-map/` の中身すべて。
- 移行先: `projects/posting-map/`

## 2. Path Alias / Import 修正一覧
ディレクトリ階層が1段深くなる（または構造が変わる）ため、以下のパス参照を修正する必要がある。
- **GASビルドスクリプト:** `tools/build_gas.py` などの対象パスを `apps/` から `projects/` へ変更。
- **フロントエンド内の相対パス:** `index.html` から読み込んでいる `render.js`, `app.js` 等は同一ディレクトリ内であれば影響なし。
- **共有ファイル参照:** `shared/` への参照パスがある場合、`../../shared/` から `../../../AIOS_Core/sdk/` などの新しいパスへ修正。

## 3. Build & CI 変更
- `.github/workflows/cie.yml`: 対象ディレクトリを `apps/` から `projects/` へ変更。
- デプロイメントスクリプト（`tools/deploy/` 系）の監視パスとビルドパスの修正。

## 4. 固有設定ファイル (`.clasp.json`) の移動
- 現在ルートにある `.clasp.json` はPOSTING MAP用のものである可能性が高い。これを `projects/posting-map/` 配下に移動し、プロジェクトごとにGASデプロイメントを管理するアーキテクチャへ変更する。

## 5. テスト影響 (Testing Impact)
- 自動テスト（pytest等）の対象パス修正。
- ローカルシミュレーションテスト環境の Root Dir 設定変更。

## 6. Git履歴保持方法 (Git History Preservation)
ファイルの移動は単なる移動ではなく、Gitの履歴（History）を保持するため、必ず `git mv` コマンドを使用する。
```bash
git mv apps/posting-map projects/posting-map
```
移動のみのコミットを独立して行い、パスの修正コミットと分けることで追跡可能性を最大化する。
