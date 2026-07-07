# 改善検証仕様書 (Improvement Verification Specification)

## 目的
AIOS（品質保証オペレーティングシステム）において、自己改善エンジン（Self Improvement Engine）がコードを修正した際、その修正が品質を真に向上させたか（または低下させたか）を厳格に監査し、必要に応じてロールバックを実行する「改善検証（Improvement Verification）」の仕様を定義する。

---

## 責務
- **品質デグレード監査**: 改善前（Before）と改善後（After）の品質データを比較し、品質の低下（デグレード）が発生していないかを検証。
- **改善量 (Delta) の測定**: 個別カテゴリおよび総合スコアの品質差分（向上度合い）を算出。
- **ロールバック（Rollback）指揮**: 検証不合格（FAIL）時に、コードベースを修正前の安全なコミット状態へ即座に復元。

---

## 改善指標 (Improvement Metrics) & 改善量 (Delta)
検証エンジンは、改善前後の品質データを比較して「改善量（Delta）」を測定し、履歴に記録する。

### 改善量 (Delta) 算出式
個別カテゴリおよび総合スコアの向上度合い（Delta）は、以下の差分で計算される。
$$Delta = Score(After) - Score(Before)$$

### 制御ポリシー
- **品質低下の禁止 (Delta >= 0)**:
  - 総合スコアの $Delta$ がマイナス（$Delta < 0$）となった場合、または個別の重大なレビュー（Architecture、AI Smell 等）が `PASS` から `FAIL` へ悪化した場合は、改善失敗と判定され、**即座にロールバックが実行される。**
- **個別カテゴリのデルタ追跡**:
  - `Architecture Delta`
  - `Human Engineering Delta`
  - `AI Smell Delta`
  - `Design Delta`
  - `UX Delta`
  - `Runtime Delta`
  - `Output Delta`

---

## ロールバック戦略 (Rollback Strategy)
修正後の検証処理が不合格（FAIL）となった場合、コードベースの安全を確保するため、以下の戦略に従って決定論的に差し戻しを実行する。

```
[検証結果: FAIL] ──> [1. 履歴から修正前のコミットハッシュ(Previous State)を取得]
                                    │
                                    ▼
[3. 再検証 & 再レビュー] <── [2. コードベースを強制復元 (git checkout/restore)]
```

1. **修正前状態（Previous State）の特定**:
   - 改善履歴レコード（Improvement History）から、当該イテレーション開始前のGitコミットハッシュ、または退避されたコード状態を特定。
2. **コードベースの強制復元**:
   - `git checkout <commit_hash>` または `git restore` 等を実行し、修正対象ファイルを完全に修正前の状態に復帰。
3. **ロールバック完了レビュー**:
   - ロールバック後に再度簡易的な実行検証（Execution Review）を回し、システムが完全に元の正常動作状態に戻ったことを監査・PASS判定してから、改善ループを異常終了（Abort）とする。
