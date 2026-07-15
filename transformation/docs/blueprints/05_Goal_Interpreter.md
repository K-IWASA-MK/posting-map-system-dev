# Transformation OS: 10_Goal_Interpreter

## 1. 概念定義 (Concept Definition)
Goal Interpreter とは、人間（CEOなど）が発した「抽象的な目的（Goal）」をシステムが理解できる「構造化された目標定義」へと翻訳する最初の関門である。
Transformation Contract Engine は法律（評価基準）を作るシステムであり、人間の曖昧なGoalを直接解釈することはできない。したがって、Goal Interpreter の介入が必須となる。

### アーキテクチャ上の位置づけ
`CEO` ➔ `Goal (曖昧な自然言語)` ➔ **`Goal Interpreter`** ➔ `Structured Goal` ➔ `Contract Engine` ➔ `Transformation Contract` ➔ `Task Factory`

## 2. Goal Interpreter の役割
「売上を上げたい」「使いやすくして」といった抽象的なGoalを、以下の要素に分解・構造化する。

1. **対象 (Target)**: （例: POSTING MAP）
2. **期間 (Timeline)**: （例: 90日）
3. **評価方法 (Evaluation Method)**: （例: 契約数）
4. **証拠ソース (Evidence Source)**: （例: 契約DB）

ここでの分解が行われて初めて、Contract Engine は「じゃあ契約DBのXXテーブルをどう検証すればDONEとするか」という Contract（法律）を記述できるようになる。

## 3. なぜこの分離が必要か
Goal Interpreter がないまま Task Factory を作ると、Task Factory が「売上を上げるためのアイデア出し」から「実装案の策定」まで、AIとして勝手に推論して Task を量産してしまう。
Goal Interpreter を設置することで、以後のすべてのシステム（Contract Engine, Task Factory, Automation Runtime）を **「推論しない、完全に決定論的な機械」** へと変えることができる。これが Transformation OS の最も重要な設計境界である。

---
**※Transformation OS は Architecture Driven Development を採用する。Blueprint が100%承認されるまで、いかなる実装も開始してはならない。**
