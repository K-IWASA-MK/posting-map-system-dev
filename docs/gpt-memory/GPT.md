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

## Next Session

AIOS Review Engine Sprint 開始

テーマ

「レビュー文化をAIOSへ実装する」
