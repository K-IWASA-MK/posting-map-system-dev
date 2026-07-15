# AIOS Asset Model

## 目的
AIOS が「知識実行プラットフォーム (Knowledge Execution Platform)」として蓄積する資産（Assets）の分類と定義を明確にする。

## Assetsの5大分類

### 1. Plugins (プラグイン)
- **定義:** プロジェクトへインポートして使用可能な、独立した「実行可能なコードブロック・機能モジュール」。
- **特徴:** 特定のビジネスロジックを持たず、設定ファイル（config）を注入することで動作する。
- **例:** Offline Sync Plugin, Stripe Subscription Plugin, LINE Login Plugin。

### 2. Skills (スキル)
- **定義:** AIエージェントに事前学習させる「思考ルール、開発方針、特定のタスクをこなすためのプロンプトセット」。
- **特徴:** コードではなくマークダウン（`SKILL.md`）等の自然言語と構造化データで構成され、AIの初期コンテキスト（Activation）として供給される。
- **例:** Glassmorphism UI Skill, GAS Optimization Skill。

### 3. Templates (テンプレート)
- **定義:** 新規プロジェクトや新規機能を追加する際の「アーキテクチャの雛形（ボイラープレート）」。
- **特徴:** ベストプラクティスが組み込まれた初期状態のファイル群。
- **例:** Fact-Centric Dashboard Template, GAS API Controller Template。

### 4. Workflows (ワークフロー)
- **定義:** 開発、検証、デプロイ、障害対応などの「一連の自動化された業務プロセス」。
- **特徴:** スクリプトやCI/CDパイプライン設定として記述される。
- **例:** Quality Gate Validation Workflow, Production Deploy Workflow。

### 5. Knowledge (ナレッジ)
- **定義:** AIが参照可能な「業界のドメイン知識、過去のエラー解決録、意思決定プロセス（ADR）」。
- **特徴:** 失敗体験や運用上の事実を蓄積し、AIが同じミスを繰り返さないための辞書。
- **例:** 「山間部ではGPS誤差が150m出やすい」「SafariのIndexedDBではBlobが消失する」といった事実。

## Knowledge Lifecycle
1. **Elevation (昇格):** プロジェクト固有の実装から、汎用的な「Asset」へ変換する。
2. **Activation (活性化):** AIOSが開発開始時にこれらのAssetを読み込み、AIに提供する。
