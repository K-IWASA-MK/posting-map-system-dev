# GPT.md

## Current Status
- POSTING MAP Mission Control Prototype Sprint 継続中
- Dashboard Prototype Sprint 1-5 まで実施
- Mission Control のデザイン言語（Design Language）をブラッシュアップ中

---

## Today's Decisions

### 1. Dashboardレビュー方針変更
- 全体レビューをやめる
- 1コンポーネントずつレビューする
- 1px・1ms・余白単位で品質を磨く

---

### 2. KPIデザイン改善
決定事項
- KPIカードも他カードと同じデザイン言語へ統一
- 日本語タイトル
- 英語サブタイトル
- 右上ステータス表示

例

活動人数
ACTIVE MEMBERS

LIVE

---

### 3. Dashboard名称整理
Dashboard内

「活動ログ」

↓

「今日の活動」

へ変更予定

理由
- Dashboardはリアルタイム表示
- サイドメニューの「活動ログ」は履歴管理
- 時間軸を明確に分離する

---

### 4. Card Header Design System
全カード共通ルール

左上
- 日本語タイトル

左下
- 英語サブタイトル

右上
- Status

フォント
余白
色
配置

完全統一する

---

### 5. Human Engineering
現在は機能追加フェーズではない

最優先

- Typography
- Margin
- Hierarchy
- Motion
- Identity

完成を急がず磨く

---

## Strategic Decision

次フェーズでは
POSTING MAP実装を一旦止め

AIOSレビューエンジン開発

を開始する

目的

Flashを

「指示通り作るAI」

から

「自分でレビューし、自分で改善できるAI」

へ進化させる

---

## AIOS Concept

レビューエンジンを構築する

対象

- Product Review
- Design Review
- Human Engineering
- AI臭検知
- Mission Control Identity
- Typography
- Motion
- UX

将来的に

Flash

↓

AIOS Self Review

↓

Flash Self Improve

↓

CEO Review

という開発フローを実現する

---

AIOS Review Engine Sprint 開始

テーマ

「レビュー文化をAIOSへ実装する」

---

## AIOS Core Philosophy & Evolution

### The Goal of AIOS
- AIOSは「AIを賢くするシステム」ではない。
- AIOSは**「プロダクトを育てる文化を再現するシステム」**である。

### The Generation of AI Agent Development
1. **第1世代: Code Generation**
   - コードを書く、エラーを直す、機能を愚直に実装する。
2. **第2世代: Engineering**
   - 設計する、保守性を考える、SSOT（データと規則の単一ソース）を作る。
3. **第3世代: Product Engineering (現在の位置)**
   - レビューする、磨く、引き算する、ユーザーが毎日使いたくなる操作体験を作る。

### Review Engine Concept & Principles
AIOS Review Engine は、ボタンの左右をチェックする機械的な静的チェッカーではなく、プロダクト品質そのものを問い続ける。

> "Good products are not created by adding features. They are refined through continuous review."
> （良いプロダクトは、機能を増やして生まれるのではない。レビューを積み重ねることで磨かれていく。）

#### Core Audit Questions
- **Rule 0**: この変更はユーザーの行動を1秒速くしたか？
- **Hierarchy**: 情報の階層は明確かつ快適か？
- **Rhythm**: 均一さを排し、画面全体のレイアウトに強弱とリズムがあるか？
- **AI Smell**: AI特有のテンプレート感・均等さが残っていないか？
- **Identity**: この画面は「POSTING MAPらしさ（Mission Control）」を体現しているか？

### Review as a Capital Asset (知的資産としてのレビュー)
コードやデザインは書き直せるが、「なぜその余白を選んだのか」「なぜその文字にしたのか」「なぜ引き算したのか」という意志決定の意図（Contextual Decisions）こそが、他のAIや別セッションでも再利用できる最大の資産である。AIOSは、このレビュー資産を再利用可能な「オペレーティングシステム」として格納する役割を担う。
