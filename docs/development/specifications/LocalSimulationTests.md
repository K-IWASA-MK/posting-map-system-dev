# ローカルシミュレーションテスト仕様書 (Local Simulation Tests Specification)

## 概要 (Overview)
ローカルシミュレーションテストレイヤー（Local Simulation Test Layer）は、本番環境から安全に分離された Mock Runtime を利用して、AIOS Kernel 変更時の接続破壊、スキーマ不整合、および本番隔離境界の違反を自動検出するための「品質ゲート（Quality Gate）」として機能する。

---

## 品質ゲート思想 (Quality Gate Philosophy)
> ローカルシミュレーションテストは「AIOSを自動修正する仕組み」ではない。
> 変更されたコードおよび設計の品質を検証し、接続契約や本番隔離に違反したコードを本番環境へ「通過させない（ブロックする）」ための防御壁である。

---

## 検証スコープ (Test Scope)
テストレイヤーは、以下の検証項目を自動評価する。

1. **接続契約回帰検証 (Contract Regression)**
   - レイヤー間の接続 I/O における必須キー（Required Fields）、型（Type）、バージョンの一致状況を評価。
2. **シナリオ適合検証 (Scenario Regression)**
   - 正常処理ルート、自己改善早期終了ルート、および承認保留フローがシナリオ仕様通りに機能するかを検証。
3. **本番隔離境界検証 (Boundary Protection)**
   - テストコードおよびシミュレーションコード内に、本番の `SpreadsheetApp`、Stripe API、実データベース、本番ナレッジ、本番意思決定記録への参照・干渉（import）が存在しないかを検証。
4. **監査一貫性検証 (Audit Integrity)**
   - テストおよびシミュレーション監査ログが、改ざんや削除を伴わず追記のみ（Append-Only）で保存されているかを検証。

---

## 将来拡張：CI/CD ＆ Git Hook 統合 (CI/CD Future Extensions)
将来的な開発プロセスにおいて、本テストはコミット時およびデプロイ前の自動ゲートとして統合される。

```
[Developer (コード変更)]
           │
           ▼
[git commit / clasp push (フック検知)]
           │
           ▼
[Simulation Test (ローカルシミュレーションテスト自動実行)]
           │
           ├─(不合格: Quality Gate FAIL) ──> [Commit Rejected (コミット拒否・修正要求)]
           ▼
[All Tests Passed (Quality Gate PASS)] ──> [Commit Allowed (コミット許可・リリース可)]
```
