# 再開制御仕様書 (Resume Control Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、エラー、例外、タイムアウト、または保留（Pending Approval）によって処理が一時中断（Interrupted）されたカーネルパイプラインを、不整合を起こさずに安全かつ決定論的に続行（Resume）させるための制御フローおよび状態制限ルールを規定する。

---

## 再開制御原則 (Resume Guardrails)
- **再開範囲の限定 (Scope Restrictness)**:
  - 中断された処理を再開させる際、CLIOrchestratorは**「中断されたその特定の Run ID および直前の完了コンテキストのみ」を検証して引き継ぐ**ものとする。
  - 過去の無関係な履歴データベースを自動探索（Scrape）して状態を推測したり、前段の検証ステージをバイパス（省略）して途中から勝手に実行を始めることをシステムレベルで厳密に禁止する。

---

## 再開制御プロセス (Resume Flow)
再開は、以下の順序で整合性を検証した上で実行される。

```
[Resume 要求検知 (Run ID 指定)]
              │
              ▼
[1. 中断状態確認 (RunContext のステータスが Failed/Cancelled であるか)]
              │
              ▼
[2. 再開条件検証 (中断要因の解消、承認ゲートでの Approved 判定の取得等)]
              │
              ▼
[3. Scope 制限評価 (再開対象ファイル差分および引数が元と一致しているか)]
              │
              ▼
[4. パイプライン続行 (中断したレイヤーの直前完了出力を用いて処理を再開)]
```

---

## 再開制御データ構造 (Resume Session Schema)
再開要求時に検証される整合性スキーマ。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ResumeSessionRecord",
  "type": "object",
  "properties": {
    "runId": { "type": "string" },
    "interruptedLayer": { "type": "string" },
    "resumeLayer": { "type": "string" },
    "contextVerificationHash": {
      "type": "string",
      "description": "中断時の直前完了レイヤー出力JSONのハッシュ値。改ざんや不整合の検証に利用。"
    },
    "conditionsResolved": {
      "type": "boolean",
      "description": "手動承認（Approved）やエラー解消が確認されているかを示す整合フラグ。"
    }
  },
  "required": ["runId", "interruptedLayer", "resumeLayer", "contextVerificationHash", "conditionsResolved"]
}
```
