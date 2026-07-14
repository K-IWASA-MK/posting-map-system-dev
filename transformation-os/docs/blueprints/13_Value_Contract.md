# Transformation OS: 13_Value_Contract

## 1. 概念定義 (Concept Definition)
Value Contract（価値契約）とは、Goalがもたらす「抽象的な価値（Value）」を、検証可能・測定可能な「数学的制約」へと変換し固定するBlueprintである。
Transformation OS はタスクの生成を目的とせず、「価値の測定と創出」を目的とする。したがって、誰が（AIか人間か）Valueを決めたのかという曖昧さを排除し、Value自身を厳密なContract（法律）として扱う。

## 2. 責務と位置づけ (Architecture Position)
Value Contract は、Goal と Outcome の間に位置する。
`Goal` ➔ **`Value Contract`** ➔ `Value` ➔ `Outcome` ➔ `Requirement` ➔ `Execution Unit`

Goalが「配布員一覧画面を作る」である場合、Value Contract は「なぜその画面が必要か（例：管理者が即座に状況を把握するため）」を定義し、それを数値化する。

## 3. Value Contract の構成要素

Value Contract は以下の数学的・証拠的要素から構成される。

### ① Value Metrics (価値を測る指標)
何を測定して価値とするかを定義する。
* *例: 「初回画面表示時間」「目的達成までのクリック回数」「エラー発生率」*

### ② Value Evidence (価値を証明する証拠)
その指標をどこから、どのように取得するか（証拠ソース）。
* *例: 「Chrome DevTools / Lighthouse の LCP スコア」「E2Eテスト実行時のステップ数カウント」*

### ③ Value Threshold (価値達成の閾値)
価値が生み出されたと認めるための絶対的な合格ライン（ボーダーライン）。
* *例: 「初回表示3秒以内」「検索結果表示1秒以内」「状態変更アクションが2クリック以内」*

### ④ Value Validation (価値判定ルール)
取得した Evidence を Threshold に照らし合わせ、価値が破壊されていないかを判定する決定論的ロジック。

## 4. Value Score と Transformation Score の統合
Value Validation の結果は、0〜100 の **Value Score** として算出される。閾値をギリギリ満たせば80点、閾値を大きく超える速度（例：1秒）なら100点、閾値未達（例：5秒）なら0点（FAIL）となる。

このスコアは、新しい Transformation Score の中核に組み込まれる。
1. **Goal Score**
2. **Value Contract Score**
3. **Value Score** (★最重要)
4. **Outcome Score**
5. **Requirement Score**
6. **Execution Score**

## 5. Learning Runtime の学習対象 (Learning Target)
Transformation OS の最大の特徴は、**「価値だけを学習する」** ことにある。

Learning Runtime は、**Execution Unit（書かれたコード）や Requirement（仕様）を学習しない。**
システムが学習するのは **「Value Score」** のみである。「どのような設計・制約（Contract）を通ったときに Value Score が高くなったか」という【価値を生んだパターン】だけをナレッジとして抽出し、次回の Task Factory へと還元する。

これにより、Transformation OS はタスク量産システムではなく、「自律的に価値を最大化するOS」として進化する。

---
**※Transformation OS は Architecture Driven Development を採用する。Blueprint が100%承認されるまで、いかなる実装（PoC含む）も開始してはならない。**
