# 開発者品質フロー仕様書 (Developer Quality Flow Specification)

## 概要
AIOS（品質保証オペレーティングシステム）を日々の開発ワークフローに実環境で組み込み、接続契約違反や本番環境への隔離漏れを自動で防止するための「開発者向け標準開発・品質確保フロー」を規定する。

---

## 開発ライフサイクルと実行パス (Developer Flow)

```
[コード編集・設計変更]
        │
        ▼
[git commit (コミット操作)] ──> [.git/hooks/pre-commit が自動起動]
        │
        ├──(テスト失敗: Block) ──> [コミット阻止・警告出力 ──> コード修正へ戻る]
        ▼
[コミット成功 (PASS)]
        │
        ▼
[deploy_with_quality_gate.sh (デプロイ操作)]
        │
        ├──(テスト失敗: Block) ──> [clasp push 実行拒否 ──> 境界違反解消へ戻る]
        ▼
[clasp push 実行・デプロイ完了 (PASS)]
```

---

## 各接続フロー詳細

### 1. コミットフックフロー (Commit Flow)
- 開発者が `git commit` を実行した際、`.git/hooks/pre-commit` がトリガーとなり `pre-commit-simulation.sh` を呼び出す。
- `hook_runner.js` が自動テストを実行し、Quality Gate 判定に基づいて合否を調停する。
- **不合格時**: Exit Code = `1` が返り、Git コミットが取り消され（Blocked）、不適合箇所がコンソールへ警告出力される。

### 2. デプロイラッパーフロー (Deploy Flow)
- 開発者が本番またはステージングへのデプロイ（clasp push 等）を行う際、直接コマンドを叩くのではなく、`deploy_with_quality_gate.sh` を実行する。
- 内部で `pre-deploy-simulation.sh` が動き、接続整合および隔離境界（SpreadsheetやStripe干渉）を検証する。
- **合格時のみ**: `clasp push` が実行され、サーバーへ送信される。不合格時はデプロイそのものが実行されずに強制終了（Blocked）する。

---

## 障害ハンドリングと回復フロー (Failure Handling & Recovery)

### 1. コミット遮断時の回復手順
1. コンソールに出力された不合格テストケース（Failed Test Case）および失敗模擬レイヤー（Failed Layer）を確認。
2. 接続スキーマ（Kernel Contract）との不整合、または `SpreadsheetApp` 等の本番依存キーワード混入が原因であるため、該当コードを修正。
3. 再度 `git commit` を実行し、Quality Gate の PASS（Exit Code = 0）を得てコミットを成立させる。

### 2. デプロイ遮断時の回復手順
1. `deploy_with_quality_gate.sh` の失敗により `clasp push` が実行されず終了することを確認。
2. シミュレーションコードまたはテストコードに混入した本番依存コードの参照（import/require）を検出し、これを削除またはモックオブジェクトへ差し替える。
3. 再度 `deploy_with_quality_gate.sh` を起動し、デプロイゲートを通過させてサーバーへプッシュさせる。
