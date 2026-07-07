# GAS KPI プロバイダー仕様書 (GAS KPI Provider Specification)

## 目的
AIOS Dashboard へ対し、カーネルの稼働状況および各種監査結果メトリクスを出力する GAS 側のデータ提供（Provider）としての責務と論理隔離境界を定義する。

---

## GAS 側の責務 (Provider Responsibilities)
- **JSON レスポンスの提供**:
  - `getDashboardSummary()` メソッドを実行し、現在の AIOS 各部門の Output、契約ライセンス、シミュレーション完了結果を集約した単一の JSON レコードを生成・返却する。
  - レスポンスは JSON 形式のみとし、HTML やリダイレクト、画面描画を GAS 側で行うことは一切禁止する。
- **認可制御**:
  - 本番データベース（Spreadsheet）や Stripe、承認記録に対する書き込みアクションは、このデータ提供口からは一切受け付けない。

---

## セキュリティ・境界ルール (Security & Logical Isolation)
1. **書込 API の完全排除**:
  - `doPost()` や `doGet()` 内に、認可変更、Stripe 金額変更、Kernel 実行を伴うパラメータを受け付けて実行するロジックを一切配置しない。
2. **GET 通信のみへの限定**:
  - ダッシュボードが GAS を呼び出す際は、GET パラメータを用いたデータ要求のみを許可し、サーバー側の状態（State）を一切変更させない冪等（Idempotent）性を維持する。
