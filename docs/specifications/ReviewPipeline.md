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
    Prod -->|PASS / WARNING| Design[5. デザインレビュー (Design Review)]
    Design -->|PASS / WARNING| UX[6. UXレビュー (UX Review)]
    UX -->|PASS / WARNING| Runtime[7. 実行時レビュー (Runtime Review)]
    Runtime -->|PASS / WARNING| PASS_Gate{判定はPASSか？}
    
    %% FAIL時のルート
    Execution -->|FAIL| Imp[8. 改善提案 (Improvement Proposal)]
    Arch -->|FAIL| Imp
    Prod -->|FAIL| Imp
    Design -->|FAIL| Imp
    UX -->|FAIL| Imp
    Runtime -->|FAIL| Imp
    
    PASS_Gate -->|NO| Imp
    PASS_Gate -->|YES| Output[9. 出力制御 (Output Engine)]
    
    Imp --> Output
    Output --> Done([10. 合格 (PASS) / ユーザー提示])
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

### 4. デザインレビュー (Design Review)
- **概要**: 漆黒背景、ガラスモーフィズム、微発光などの「POSTING MAPデザインシステム」ルールへの適合を検証。
- **入力**: CSS、HTML、フロントエンドアセット
- **出力**: デザイン適合性判定

### 5. UXレビュー (UX Review)
- **概要**: 高齢層配慮、タッチターゲットサイズ、画面切り替え時のローディング維持、アニメーションの速度・イージングを検証。
- **入力**: UI実装コード、画面操作フロー
- **出力**: 操作性・UX適合性判定

### 6. 実行時レビュー (Runtime Review)
- **概要**: 通信切断時の挙動、エラー表示の抑制、Single API Ruleに即した通信構造を検証。
- **入力**: API統合、ローカルストレージ・キャッシュ処理
- **出力**: 実行時安定性判定

### 7. 改善提案 (Improvement Proposal)
- **概要**: 上記いずれかのステージで `FAIL` が検知された場合、問題の原因究明と具体的な修正方針・差分コードを自動生成。
- **入力**: 各レビューステージの検出違反データ
- **出力**: 改善提案書 (Improvement Proposal JSON/Markdown)

### 8. 出力制御 (Output Engine)
- **概要**: レビューの成否にかかわらず、ユーザーに結果を提示する前に、Output Engine仕様に沿って出力を「日本語化」「フォーマット統一」「1つのコードブロック化」「不要な英語排除」する。
- **入力**: 改善提案書またはPASS判定結果
- **出力**: 最終提示テキスト（出力原則準拠）

---

## 判定マージおよび早期終了ポリシー (Early Termination)
- **早期終了 (Early Termination)**:
  - いずれかのステージで `FAIL` が確定した場合、後続のレビューはスキップされ、即座に「改善提案 (Improvement Proposal)」ステージに遷移する。
- **判定マージ (Decision Merge)**:
  - すべての検証ステージが `PASS` である場合のみ、総合判定は `PASS` となる。
  - `WARNING` が含まれる場合は、総合判定は `PASS (警告あり)` となるが、リリースの可否はユーザーの判断に委ねられる。
