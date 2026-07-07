# レビューパイプライン仕様書 (Review Pipeline Specification)

## 目的
本仕様書は、AIOS (品質保証オペレーティングシステム) におけるコードおよびドキュメントの検証処理を決定論的に制御するため、各種レビューの実行ステージの順序、中間コンテキスト、判定合成ロジック、および最終出力制御の統合フローを規定する。

## パイプライン実行順 (Review Sequence)
AIOSのレビュープロセスは、以下の直線的フローに従って自律的に実行される。

```mermaid
flowchart TD
    Start([1. 実装完了 / コミット検知]) --> Execution[2. 実行検証 (Execution)]
    Execution -->|PASS / WARNING| Arch[3. アーキテクチャレビュー (Architecture Review)]
    Arch -->|PASS / WARNING| Prod[4. プロダクトレビュー (Product Review)]
    Prod -->|PASS / WARNING| HumEng[5. 人間工学レビュー (Human Engineering Review)]
    HumEng -->|PASS / WARNING| Design[6. デザインレビュー (Design Review)]
    Design -->|PASS / WARNING| UX[7. UXレビュー (UX Review)]
    UX -->|PASS / WARNING| Runtime[8. 実行時レビュー (Runtime Review)]
    Runtime -->|PASS / WARNING| AISmell[9. AI臭レビュー (AI Smell Review)]
    AISmell -->|PASS / WARNING| Score[10. 品質スコアリング (Quality Score)]
    Score --> SelfReview[11. 自己レビュー (Self Review)]
    SelfReview -->|AUTO_IMPROVE| SelfImprove[12. 自己改善 (Self Improvement)]
    SelfImprove --> Learn[13. 学習 (Learning)]
    Learn --> Opt[14. 知識最適化 (Knowledge Optimization)]
    Opt --> Gov[15. ガバナンス (Governance)]
    Gov --> Output[16. 出力制御 (Output Engine)]
    
    SelfReview -->|BYPASS_PASS / ESCALATE| Learn
    
    %% FAIL時のルート
    Execution -->|FAIL| Imp[改善提案 (Improvement Proposal)]
    Arch -->|FAIL| Imp
    Prod -->|FAIL| Imp
    HumEng -->|FAIL| Imp
    Design -->|FAIL| Imp
    UX -->|FAIL| Imp
    Runtime -->|FAIL| Imp
    AISmell -->|FAIL| Imp
    
    Imp --> Output
    Output --> Done([17. 合格 (PASS) / ユーザー提示])
```

## 各ステージの定義

### 1. 実行検証 (Execution)
- **概要**: 基本的な文法チェック、linterの実行、およびユニットテストを実行し、コードとして動作するかを機械的に検証。
- **入力**: 変更コード差分 (Diff)
- **出力**: 構文チェックおよびテスト実行結果

### 2. アーキテクチャレビュー (Architecture Review)
- **概要**: 依存方向の順守、薄いフロントエンド原則、スプレッドシートの純粋性、GASのビジネスロジック集中を検証。
- **入力**: 依存関係グラフ、変更ファイル構造
- **出力**: アーキテクチャ整合性監査結果

### 3. プロダクトレビュー (Product Review)
- **概要**: 実装が要求仕様（ドキュメントやチケット）を満たしているか、機能面から検証。
- **入力**: 要求仕様ドキュメント、実装変更コード
- **出力**: 機能適合性判定

### 4. 人間工学レビュー (Human Engineering Review)
- **概要**: 現場実用性のチェック、第0原則への適合性、Mission Control思想に基づいた情報配置を検証。
- **入力**: 画面UIコード、ワイヤーフレーム・構造定義
- **出力**: 人間工学適合性判定

### 5. デザインレビュー (Design Review)
- **概要**: 漆黒背景、ガラスモーフィズム、微発光などの「POSTING MAPデザインシステム」ルールへの適合を検証。
- **入力**: CSS、HTML、フロントエンドアセット
- **出力**: デザイン適合性判定

### 6. UXレビュー (UX Review)
- **概要**: 高齢層配慮、タッチターゲットサイズ、画面切り替え時のローディング維持、アニメーションの速度・イージングを検証。
- **入力**: UI実装コード、画面操作フロー
- **出力**: 操作性・UX適合性判定

### 7. 実行時レビュー (Runtime Review)
- **概要**: 通信切断時の挙動、エラー表示の抑制、Single API Ruleに即した通信構造を検証。
- **入力**: API統合、ローカルストレージ・キャッシュ処理
- **出力**: 実行時安定性判定

### 8. AI臭レビュー (AI Smell Review)
- **概要**: 均等グリッド、均一なカード配置、テンプレート感、無意味なGlowなどのAI臭レベルを判定（Level 0〜3）。
- **入力**: UIコード、CSS、HTML構造
- **出力**: AI Smell Level（AI臭レベル判定結果）

### 9. 品質スコアリング (Quality Score)
- **概要**: 収集したレビューデータを集約し、標準比重（Weight）に基づいて総合スコア（Overall Score）および優先順位（Priority）を計算。`ScoreSchema` 準拠のJSONデータを生成。
- **入力**: 各レビューレイヤーの検証結果データ
- **出力**: 品質スコアJSON (QualityScore JSON)

### 10. 自己レビュー (Self Review)
- **概要**: 品質スコアに基づき改善方針判定（Improvement Decision）を行い、改善タスクを生成。改善完了基準または改善停止条件（Stop Rule）を満たしていない場合は、改善タスクを Self Improvement へ送信し、再レビューへループ。
- **入力**: 品質スコアJSON
- **出力**: 改善決定判定、改善タスク（Improvement Proposal）または完了通知

### 11. 自己改善 (Self Improvement)
- **概要**: 改善計画（Plan）を立案・承認し、最小の責務単位（Execution Unit）に分割してコード修正を段階的に実行。適用後に改善前後の品質差分（Delta）やロールバック（Rollback Strategy）を管理。
- **入力**: 改善提案（Improvement Proposal）
- **出力**: 修正コードの適用、検証結果、改善履歴データ

### 12. 学習 (Learning)
- **概要**: 改善効果の証明された解決パターンから「改善パターン抽出」を行い、「知識検証（Knowledge Validation）」を経て「知識進化（Knowledge Evolution）」および「推薦（Recommendation）」を実行。
- **入力**: 改善履歴、品質スコア履歴
- **出力**: 新規ナレッジ定義、推薦情報、学習履歴データ

### 13. 知識最適化 (Knowledge Optimization)
- **概要**: 蓄積されたナレッジデータベースの評価・整理・最適化。ナレッジごとの健康評価（Health）、重複検知（Merge）、不足領域検出（Gap）を行い、全体の統計指標（Metrics）と推奨状態を付与した最適化レポート（Optimization Report）を生成。
- **入力**: 既存ナレッジリスト、学習結果、レビュー実績ログ
- **出力**: 知識最適化レポート（Optimization Report）

### 14. ガバナンス (Governance)
- **概要**: 提示された最適化レポートに基づき、ガバナンスポリシー・ルールの適合審査、人間承認ゲートによる保留制御、および不変の意思決定記録（Decision）・監査ログ（Audit）を管理。
- **入力**: 知識最適化レポート、ポリシー定義、評価ルール
- **出力**: 意思決定記録（Decision Record）、監査ログ（Audit Log）、実行許可状態

### 15. 出力制御 (Output Engine)
- **概要**: 品質スコアデータ、改善提案・履歴・学習結果および知識最適化レポート・ガバナンス結果を受け取り、Output Engine仕様に沿って「日本語化」「フォーマット統一」「1つのコードブロック化」してユーザーに提示する。
- **入力**: 品質スコアJSON、改善タスク、学習・推薦履歴、知識最適化レポート、意思決定記録
- **出力**: 最終提示テキスト（出力原則準拠）

---

## ダッシュボード観測統合 (Dashboard Observer Integration)
本レビューパイプラインは、ダッシュボード（Observer Layer）に対して処理ステージ遷移や中間出力を非同期にイベント通知する接続モデルを持つ。

```text
Kernel Pipeline (実処理フロー)
         │
         ├─(非同期イベント通知・JSON出力)
         ▼
Dashboard Observer (横断観測レイヤー)
         │
         ▼
Visualization (UI表示・可視化)
```

- **接続要件**:
  - ダッシュボードはパイプラインの順序や実行内容そのもの（Pipeline Control）には一切介入できない（単方向の監視専用）。
  - いずれかのカーネルレイヤーが処理を完了した際、または異常を検知した際、進捗状況（Status）および生成された出力JSONがObserverを介してダッシュボードに反映される。

---

## 判定マージおよび早期終了ポリシー (Early Termination)
- **早期終了 (Early Termination)**:
  - いずれかのステージで `FAIL` が確定した場合、後続のレビューはスキップされ、即座に「改善提案 (Improvement Proposal)」ステージに遷移する。
  - 特に、**AI臭レビューにおいて検出された AI臭（AI Smell）の重大度が Level 2（中程度）以上である場合は、即座に FAIL と判定し早期終了する。**
- **判定マージ (Decision Merge)**:
  - すべての検証ステージが `PASS` である場合のみ、総合判定は `PASS` となる。
  - `WARNING` が含まれる場合は、総合判定は `PASS (警告あり)` となるが、リリースの可否はユーザーの判断に委ねられる。
