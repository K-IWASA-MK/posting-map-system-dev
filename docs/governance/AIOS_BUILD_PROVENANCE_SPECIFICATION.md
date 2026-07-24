# AIOS Build Provenance Specification v1.0

## 1. 目的とスコープ
本仕様書は、AIOS（AI Development OS）配下で開発・運用されるすべてのアプリケーションに対して、**「Deterministic（決定論的）、Traceable（追跡可能）、Auditable（監査可能）」** なビルド情報の提供を義務付けるための仕様である。
Build Provenance は「どのソースコードのどの状態から、誰が生成したか」を証明する情報を指す。

## 2. 実装要件 (Manifest)
リポジトリのルートディレクトリに `build-manifest.json` を配置し、以下のスキーマに従って情報を保持すること。将来的に、このマニフェストは API レスポンスや AIOS Runtime 経由での参照も想定される。

### 2.1 必須項目 (Required)
- `buildId` (String): ビルドの一意な識別子（例: `YYYYMMDD-HHMM-CommitHash`）
- `gitCommit` (String): 元となったソースコードのGitコミットハッシュ
- `branch` (String): ビルド元のブランチ名
- `generatedAt` (String): ビルド生成日時（ISO 8601形式等）
- `publishTarget` (String): デプロイ先の環境名（例: `GitHub Pages`, `Vercel`, `GCP`）
- `entryPoint` (String): アプリケーションの公開エントリーポイント（例: `/index.html`）

### 2.2 拡張項目 (Optional)
- `specificationVersion` (String): 本仕様書の準拠バージョン（例: `"1.0"`）
- `application` (String): 対象アプリケーション名
- `generator` (String): ビルドを実行した主体（例: `AIOS (Antigravity)`, `GitHub Actions`）
- `verificationStatus` (String): ビルドの検証状態（例: `VERIFIED`, `PENDING`）
- `buildEnvironment` (String): ビルド環境のメタデータ

### 2.3 JSON構成例
```json
{
  "specificationVersion": "1.0",
  "application": "POSTING MAP",
  "buildId": "20260724-1534-ab300e1",
  "gitCommit": "ab300e1",
  "branch": "main",
  "generatedAt": "2026-07-24T15:34:00Z",
  "publishTarget": "GitHub Pages",
  "entryPoint": "/index.html",
  "generator": "AIOS (Antigravity)",
  "verificationStatus": "VERIFIED"
}
```

## 3. 実装要件 (HTML Meta Tags)
フロントエンドアプリケーション（例: SPA）においては、ルートとなる `index.html` の `<head>` セクション内に、同等の Provenance 情報をメタタグとして埋め込むこと。

```html
<meta name="build-id" content="20260724-1534-ab300e1">
<meta name="git-commit" content="ab300e1">
<meta name="build-source" content="main">
<meta name="publish-target" content="GitHub Pages">
```

これにより、ブラウザのソースコードから直接トレースが可能になる。
