# 統合検証仕様書 (Integration Verification Specification)

## 目的
AIOS品質ゲートのフック接続（Pre-Commit / Pre-Deploy）およびインストールスクリプトが実環境で要件通りに適用され、不適合時に例外なくプロセスをブロックできることを検証するためのテスト検証計画および適合性確認手順を定義する。

---

## 検証チェックリスト (Verification Checklist)

### 1. Hook Installation の検証
- **検証手順**: `./tools/hooks/install-hooks.sh` を実行する。
- **合格基準**:
  - ファイル `.git/hooks/pre-commit` が自動生成され、かつ実行可能権限（chmod +x）が付与されていること。
  - テスト監査ログ `simulation_audit.log` に `HookInstalled` イベントが追記記録されること。

### 2. Commit Block / PASS の検証
- **正常検証 (PASS)**:
  - 正常状態で `git commit`（またはモックシミュレーションフック）を実行。テストスイートがすべて PASS し、`QUALITY GATE: PASS`（Exit Code = 0）でコミットが許可されることを確認。
- **異常遮断検証 (BLOCK)**:
  - `src/simulation/` のファイル内に一時的に禁止キーワード `SpreadsheetApp` または `clasp` を挿入。
  - その後 `git commit`（またはモックフック）を実行し、`QUALITY GATE: BLOCKED`（Exit Code = 1）が返され、コミット操作が即座に中断されることを確認。

### 3. Deploy Wrapper (clasp push) の検証
- **正常デプロイ (PASS)**:
  - `./tools/deploy/deploy_with_quality_gate.sh` を起動。テストがすべて PASS 判定され、最終的に `clasp push`（本番環境では模擬コマンド）が呼び出されることを確認。
- **デプロイ遮断 (BLOCK)**:
  - 接続契約違反または境界違反を模した異常状態で `./tools/deploy/deploy_with_quality_gate.sh` を起動。
  - ゲート判定が `BLOCKED` となり、`clasp push` が実行されず途中でエラー終了（Exit Code = 1）することを確認。

---

## 監査イベントの確認手順 (Audit Event Verification)
各検証の完了後、不変監査ログ `tools/simulation_audit.log` を開き、以下のイベントが時系列順に追記（Append-Only）保存されているかを検証する。

1. `HookInstalled`: インストール実行ログ。
2. `HookTriggered`: フック開始ログ。起動された元のイベント名（`git-pre-commit` 等）およびコマンド。
3. `HookCompleted`: フック終了ログ。Quality Gate 総合合否（`Passed` / `Blocked`）および終了 Exit コード。
