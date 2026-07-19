# 依存関係ルールとインポート規制 (Dependency Rules)

## 概要
本仕様書は、AIOS プラットフォームにおけるコードのモジュール間およびレイヤー間の依存関係ルールを厳格に定義します。

## 依存関係の基本原則
1. **単方向依存性の徹底 (Strict Unidirectional Dependency)**
   - 依存方向は常に「上位レイヤーから下位レイヤー」への一方向でなければなりません。下位レイヤーから上位レイヤー（例: `core` から `runtime`、`runtime` から `sdk`）へのインポートは厳格に禁止されます。
2. **横方向（ドメイン間）の直接依存禁止 (No Cross-Domain Coupling)**
   - アプリケーション層のドメインモジュール間（例: `domain/feature-A` から `domain/feature-B`）の直接的なインポートは禁止されます。ドメイン間の通信が必要な場合は、共通のインターフェース層または `RuntimeEventBus` を介さなければなりません。
3. **インフラ層からドメインロジックへの依存禁止 (Infrastructure Isolation)**
   - インフラストラクチャ層（データベース接続、ファイル永続化、通信クライアントの実装）は、ドメインのビジネスロジックやドメインサービスに依存してはなりません。

## インポートパス規制

### 1. エイリアスインポートの使用
すべての内部モジュール呼び出しは、パス解決の曖昧さを避けるため、定義されたエイリアス（例: `@core`, `@runtime`, `@sdk`, `@domain`）を使用することを推奨します。

### 2. プラットフォーム内部の保護
アプリケーション層コードにおける以下のディレクトリ・パスへの相対・絶対インポートは、ビルドエラーとして検出され、コミットおよびプッシュがブロックされます。

- `/core/*`
- `/runtime/*`
- `/automation/*`
- `/governance/*`
- `/monitoring/*`
- `/optimization/*`
- `/selfregulation/*`
- `/transformation/*`
- `/audit/*`
- `/learning/*`

## 自動検証との連動
本プロジェクトには `tools/architecture-check.ts` が配備されており、`npm run architecture:test` または `npm run quality:check` の実行時に以下の項目を検証します。

1. **プラットフォーム内部インポート違反の検出**: アプリケーションコードがプラットフォームの内部ソースディレクトリから直接インポートしていないか。
2. **レイヤー違反の検出**: レイヤー `allowedDependencies` に定義されていないレイヤー間のインポートが行われていないか。
3. **ドメインクロス依存違反の検出**: `domain/` 内の別々のフィーチャーディレクトリ同士が、共通レイヤーを経由せずに直接インポートし合っていないか。

```typescript
// 許容される依存構造の抜粋 (tools/architecture-check.ts 内の定義)
const allowedDependencies: Record<string, string[]> = {
  'core': [],
  'foundation': ['core'],
  'domain': ['core', 'foundation'],
  'application': ['core', 'foundation', 'domain'],
  'infrastructure': ['core', 'foundation', 'domain'],
  'api': ['core', 'foundation', 'application']
};
```
これらのルールに違反したコードが存在する場合、チェックプロセスは終了コード `1` で異常終了し、Git Commit/Push ワークフローが中断されます。
