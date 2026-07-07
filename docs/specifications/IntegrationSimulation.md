# 統合シミュレーション仕様書 (Integration Simulation Specification)

## 設計思想 (Philosophy)
> シミュレーションモックは「AIOSを実稼働させる環境」ではない。
> AIOS Kernel を構成する各レイヤー間の「接続契約（Contract）の整合性とスキーマ遷移」を安全に検証するためのテスト環境である。
> 本番環境（Spreadsheet、Stripe決済、実ナレッジ等）から完全に論理隔離された「サンドボックス境界（Sandbox Border）」を形成する。

---

## 目的
AIOS（品質保証オペレーティングシステム）において、これまで策定された10個のコンポーネントが、想定通りの I/O 整合性、状態遷移（State Transition）、エラー処理、および承認ゲート制御を満たして稼働するかを検証する「統合シミュレーション基盤（Simulation Foundation）」を規定する。

---

## 隔離原則 (Sandbox Guardrails)
シミュレーション実行は、本番環境への変更影響を一切与えないよう、以下の隔離原則を厳格に順守する。

- **本番Kernelおよび実データの非変更**:
  - シミュレーションの実行によって、本番のナレッジファイルが変更されたり、本番のガバナンス意思決定記録（Decision Record）が生成されたりすることを完全に禁止する。
- **外部決済の完全模擬化**:
  - Stripe などの外部決済APIへの接続は一切行わず、アダプター層での Webhook 通知をメモリ上でダミー生成（Mock Payment Event）するだけに限定する。
- **Mock 承認の非伝合**:
  - シミュレーション内で承認ゲートが `Approved` に遷移した場合であっても、それはシミュレーション環境内でのみ機能し、本番の実行可能メタデータ（Authorized Status）へ波及させてはならない。

---

## シミュレーション処理フロー (Simulation Flow)
シミュレーターは、指定されたテストシナリオ（Scenario）に従って Mock Kernel を順次実行し、そのスキーマ不整合を監視する。

```
[CLI: simulate-kernel-flow] ──> [Simulation Scenario (テスト指示)]
                                             │
                                             ▼
[Kernel Contract (スキーマ契約)] ──> [Mock Kernel Engine (検証用模擬モジュール)]
                                             │
                                             ▼
[Simulation Audit (追記監査ログ)] ──> [Simulation Result (Passed/Failed)]
                                             │
                                             ▼
                                     [Human Visual UI]
```
