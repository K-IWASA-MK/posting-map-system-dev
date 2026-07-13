# AIOS Audit OS Specification (監査品質統制規範)

Version: 1.0.0
Phase: Phase 102 (AuditOS Foundation)
Status: Approved

---

## 1. 目的 (Purpose)
本仕様書は、AIOS (Artificial Intelligence Operating System) および CIE (Code Intelligence Engine) プラットフォームにおける品質保証および自動検証プロセスを定義する **AuditOS** のアーキテクチャおよび原則を規定することを目的とします。
AuditOS は、コードやプロセスの品質劣化および設計原則からの乖離を「水際で阻止 (Preventive Gate)」するための監査基盤となります。

---

## 2. 監査原則 (Audit Principles)
AuditOS を運用するにあたり、以下の品質保証原則を例外なく厳密に順守しなければなりません。

1. **Evidence First (証拠優先)**:
   すべての監査および評価判定は、静的コード解析、テスト実行結果、シリアライズログなどの客観的なデータ（エビデンス）に基づいて機械的に判定されなければなりません。
2. **Reproducibility (再現性)**:
   同一のソースコードベースおよび監査ルールに対して、監査判定は常に同一の結果（決定論的結果）が再現されなければなりません。
3. **Non-destructive (非破壊性)**:
   監査処理自体は完全に読み取り専用（Side Effect Free）であり、ソースコードの書き換えやデータベース破壊などの破壊的な副作用を引き起こしてはなりません。
4. **Human Approval First (人間承認優先)**:
   自動監査結果は人間（岩佐CEO）の最終的なリリース判定またはゲート開閉判断をサポートするための材料であり、人間の明示的な承認なしでの本番デプロイ等は行いません。
5. **Continuous Improvement (継続的改善)**:
   プラットフォームの開発プロセスやモジュールの進化に合わせて、監査ルールおよび監査定義（Blueprint）も常に見直され、進化し続ける設計とします。

---

## 3. 監査範囲 (Audit Scope)
AuditOS の監査対象（検証領域）は以下の通り定義されます。

* **Runtime (ランタイム領域)**:
  実行時のDTO構造、シリアライズ Round Trip の等価性、例外ハンドリングの動作。
* **Workflow (開発フロー領域)**:
  開発フェーズの移行、計画の承認有無、およびライフサイクル管理の順守率。
* **Plugin (プラグイン領域)**:
  各機能モジュール（プラグイン）の依存チェーンの解決、メタデータの整合性、DTO/Managerの分離規律。
* **Documentation (ドキュメント領域)**:
  `HANDOVER.md` や `walkthrough.md`、`task.md` の更新有無および記載の整合性。
* **Specifications (仕様書領域)**:
  `DevelopmentOS.md` や本仕様書を含む仕様ドキュメント類の改ざんチェックおよび更新履歴の監査。
* **Development Process (開発プロセス領域)**:
  Gitコミット規則（メッセージプレフィックス等）およびプッシュ先リモート（`origin-dev`）の順守チェック。

---

## 4. 監査アーキテクチャ & コンポーネント (Audit Architecture)

### 4.1 監査ライフサイクル (Audit Lifecycle)
監査は以下のステージを経て実行・記録されます。
1. **トリガー (Trigger)**: コミット前（Git Hook）、ビルド時、またはCLI起動時に自動起動。
2. **準備 (Prepare)**: 監査対象オブジェクトおよびルールのロード。
3. **ルール適用 (Apply Rules)**: 各カテゴリの適合性チェックの並行／シーケンシャル評価。
4. **評価 (Evaluate)**: 違反の重大度判定（レベル評価）。
5. **人間による確認 (Human Review)**: 開発者およびCEOへの監査レポートの提示。
6. **記録 (Persist)**: 不変の監査履歴（Audit History）への永続化。

### 4.2 監査カテゴリ (Audit Categories)
* **構造監査 (Architecture Audit)**: レイヤー間の不正参照の検出。
* **DTO監査 (DTO Audit)**: DTOクラスの命名規則およびプロパティ型のチェック。
* **マネージャ監査 (Manager Audit)**: マネージャクラスのStateless性および非破壊書き換え原則のチェック。
* **CLI監査 (CLI Audit)**: `tools/cie.py` のコマンド定義および成果物JSON定義の整合性チェック。
* **シリアライズ監査 (Serialization Audit)**: 全DTOのシリアライズ・デシリアライズ完全整合性チェック。
* **コンテキスト漏洩監査 (No Context Leak Audit)**: `Context` という用語の漏洩チェック。

### 4.3 監査レベル (Audit Levels)
* **Critical (致命的)**: 設計原則の違反。ゲートによる変更適用を強制遮断（FAIL判定）。
* **Warning (警告)**: 設計整合性の不一致またはドキュメントの更新漏れ。警告ログを出力し、人間の追加確認を促す。
* **Info (情報)**: 監査履歴に記録する統計的情報。

### 4.4 監査責任境界 (Audit Responsibilities)
* **AI開発エージェント**: 実装前に本仕様に基づきセルフチェックを行い、違反のないコードのみをコミットすること。
* **監査エンジン**: 開発者の主観に依存せず、AST解析等を用いて客観的にルールを評価すること。
* **人間（管理者）**: 警告事項のオーバーライド判断および最終的な適用判断（GO）の決定。

### 4.5 監査レポート (Audit Reporting)
* 監査結果は `foundation_audit.json` などの構造化ファイルへ自動保存されるとともに、人が視覚的に把握できるコンソール要約（PASS/FAIL および Health Status）として即時出力されなければなりません。

### 4.6 監査履歴 (Audit History)
* 監査の実行ログは改ざん不可能な時系列データとして保管され、後からのトレーサビリティおよび品質推移（Quality Metrics）の分析に利用されます。

---

## 5. 将来の拡張点 (Future Extension Points)
本仕様書に基づき、以降のフェーズで以下の統制システムを安全に統合します。
* **Rule Registry (ルールレジストリ - Phase 103)**:
  監査ルールの動的追加およびルール自体のバージョン管理を行うリポジトリ。
* **Incident Registry (インシデントレジストリ - Phase 104)**:
  監査で検出された違反内容と修正プロセスを管理するトラッキングデータベース。
* **Preventive Gate (事前防御ゲート - Phase 105)**:
  Gitコミット／プッシュ時、またはビルド時に違反がある変更を自動的に遮断する水際阻止ゲートウェイ。
