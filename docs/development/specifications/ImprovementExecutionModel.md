# 改善実行モデル仕様書 (Improvement Execution Model Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、改善プランナーが立案した計画（Plan）に基づき、各タスクを最小の責務単位で実行し、検証から再レビューまでを統制する「改善実行モデル（Improvement Execution Model）」の仕様を定義する。

---

## 改善実行フロー (Execution Flow)
各改善タスクは、以下の直線的で安全なフェーズ遷移によって実行される。

```
[1. 改善計画 (Plan)] ──> [2. タスク生成 (Task Generation)] ──> [3. 実行ユニット起動 (Execution Unit)]
                                                                           │
                                                                           ▼
[PASS (合格)] <── [6. 再レビュー (Review)] <── [5. 比較検証 (Verification)] <── [4. コード適用]
```

1. **改善計画 (Improvement Plan)**: 依存関係が解決され、順序付けられた全体のタスク計画。
2. **タスク生成 (Task Generation)**: 個別タスクに対し、具体的な適用内容、期待される効果、および関連するレビュー規則ID（Rule ID）を含んだ指令メタデータ（Task Spec）を生成。
3. **実行ユニット起動 (Execution Unit)**:
   - 変更は、必ず**「1つの実行ユニット ＝ 1つのファイルまたは1つの最小責務」**（Execution Unit）として起動する。
   - 複数の無関係な修正を一度に一つの実行ユニットに割り当てることを禁止する。
4. **コード適用**: 実行ユニットが指定された対象ファイルに対して修正コードを適用。
5. **比較検証 (Verification)**: 修正がビルドを壊していないか、および改善量（Delta）が正であるかを監査。
6. **再レビュー (Review)**: 修正適用部分をレビューパイプラインに流して適合性を確認。

---

## 将来の自動実行（AIエージェント）への拡張性 (Agent Extensibility)
本モデルは、将来的な開発フェーズにおいて「コードを書き換える自動エージェント（FlashやPro）」が実行部としてシームレスに結合できるよう、以下の標準入出力メタデータ（JSONインターフェース）に基づいてインターフェースが定義される。

### 実行ユニットの入力定義 (Execution Unit Input Spec)
```json
{
  "unitId": "UT-2026-0012",
  "targetFile": "/Volumes/SSD_DATA/posting-map-system/tailwind-utils.css",
  "instruction": "ボトムナビの背景色をrgba(255,255,255,0.08)にし、枠線を1px rgba(255,255,255,0.1)に修正してください。余白をp-2に変更します。",
  "targetRules": ["RULE-UI-GLASS-001", "RULE-UI-SPACING-002"],
  "riskLevel": "Low"
}
```

### 実行ユニットの出力定義 (Execution Unit Output Spec)
```json
{
  "unitId": "UT-2026-0012",
  "executionStatus": "SUCCESS",
  "modifiedDiff": "@@ -12,3 +12,3 @@\n- background: rgba(255,255,255,0.15);\n+ background: rgba(255,255,255,0.08);\n+ border: 1px solid rgba(255,255,255,0.1);",
  "errorLog": ""
}
```
このメタデータ定義の標準化により、実際の書き換えを担当するAIモデルが変更された場合でも、AIOSの実行制御エンジンは修正を加えることなく動作を継続することが可能となる。
