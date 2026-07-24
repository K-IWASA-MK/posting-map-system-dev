# AIOS Release Governance Specification v1.0

## 1. 目的とスコープ
本仕様書は、AIOS（AI Development OS）において「いつ、どのような条件でアプリケーションを公開・デプロイしてよいか」を厳格に管理するリリースガバナンスの標準仕様である。すべてのAI社員は、本仕様に定義される **Publish Consistency Gate** を通過せずにデプロイやリリースを進めてはならない。

## 2. Publish Consistency Gate v1.0
すべてのデプロイ（GitHub Pages等の本番公開）の提案前に、AI社員は必ず以下の整合性を自動チェックすること。
いずれかの項目が不合格（未達・不一致）の場合、デプロイプロセスを中断し、ユーザーに `❌ Deploy BLOCK` として警告すること。

### 2.1 SSOT (Single Source of Truth) と公開対象の一致
- **公開ディレクトリの一致**: 公開先として指定されたディレクトリ（例: リポジトリルート `/`）が、正式なSSOTと一致しているか確認する。
- **廃止ファイルの除外**: 二重管理の温床となる古いファイル（例: `projects/posting-map/index.html`）が存在する場合、それが廃止予定 (Deprecated) であるか確認し、公開対象から除外されていることを保証する。

### 2.2 Build Provenance の埋め込みと整合性
- **Manifest の検証**: `build-manifest.json` が生成されており、`AIOS_BUILD_PROVENANCE_SPECIFICATION.md` に準拠しているか確認する。
- **HTML Meta Tags の検証**: フロントエンドのエントリポイント（例: `index.html`）内に、Build Provenance メタタグが正しく埋め込まれているか確認する。
- **一致の確認**: **Repository Build ID** と、**Published Build ID** （これからデプロイされるもの）が完全に一致するか照合する。

### 2.3 最新ビルド識別子と防御コードの存在
- **固有識別子の確認**: デバッグ表示（`liff-hud` 等）や特定の識別用コードブロックが存在するか。
- **防御ガードの確認**: ランタイムエラーを防ぐためのガードロジック（例: `!appData || !Array.isArray(appData.areas)`）が存在するか。
- **フォールバック処理**: 非推奨環境（PC等）からのアクセスに対するフォールバック処理（例: `initLiff` 失敗時の動作）が存在するか。

### 2.4 アセットパスと環境変数の正確性
- **ローダー・アセットのパス**: `client-loader.js` やCSS、画像ファイルなどの読み込みパスが、公開時のディレクトリ構造において正しいか。
- **公開URL整合性**: LIFF Endpoint URL などの外部連携設定と、実際の公開URL（例: `https://k-iwasa-mk.github.io/posting-map-system-dev/`）が一致していること。

## 3. デプロイ承認 (Release Approval)
上記の Publish Consistency Gate を全件通過した場合のみ、AI社員はユーザーに対してデプロイ可能である旨を報告し、承認（Proceed）を要求できる。ユーザーの明示的な承認なしに、スクリプトやCIを利用した自動デプロイをAIが単独で強行してはならない。
