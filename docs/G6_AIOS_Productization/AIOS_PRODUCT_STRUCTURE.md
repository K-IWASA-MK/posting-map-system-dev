# AIOS Product Directory Specification

## 目的
独立した製品としての AIOS の最終的なディレクトリ構造仕様を定義する。

## ディレクトリツリーと責務

```text
AIOS_ROOT/
 ├── kernel/        # 【Core】AIエージェントの思考エンジン、システムイベントバス。
 ├── runtime/       # 【Core】ローカルシミュレーション、実行環境のベース。
 ├── sdk/           # 【Core】Projectが利用するAPIクライアントや共通ユーティリティ。
 ├── plugins/       # 【Asset】実証済みの汎用機能（Offline Sync, Stripe Billing 等）。
 ├── skills/        # 【Asset】AIへの命令セット・コンテキスト。
 ├── templates/     # 【Asset】UIやアーキテクチャのプロジェクト雛形。
 ├── workflows/     # 【Asset】自動化プロセス（デプロイ、品質監査等）。
 ├── knowledge/     # 【Asset】ドメイン知識、エラー解決録。
 ├── marketplace/   # 【Core】サードパーティ製のAssetsをインストール・管理する基盤。
 ├── tools/         # 【Core】CLIツール群（品質レビュー、パッチ生成等）。
 ├── docs/          # 【Core】AIOS自体の仕様書、APIドキュメント。
 │
 └── projects/      # 【Applications】AIOS上で開発される実際のSaaS/アプリ。
      ├── posting-map/  # 公式プロジェクト第1号
      └── ...
```

## 制約事項 (Constraints)

1. **依存方向:** `projects/` 内のコードは `sdk/` や `plugins/` を参照できるが、AIOS Core 側から `projects/` 内のモジュールを直接 import することは禁止。
2. **ガバナンス:** `AGENTS.md` は AIOS Root（全プロジェクト共通）と、各 `projects/` 配下（プロジェクト固有）の階層構造を持つ。
3. **Knowledge Elevation対象:** `projects/` 内で汎用性が実証された機能は、ディレクトリを移動し、抽象化された上で `plugins/` や `skills/` 等へ昇格する。
4. **Marketplace対象:** 今後、`plugins/` や `workflows/` の一部は `marketplace/` を通じて外部からインストール可能な形式（マニフェスト管理）とする。
