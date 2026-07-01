# Implementation Plan - Phase142.6: Self-Rewriting Safety Model Layer

## 1. Architecture Goal
Phase143（Self-Rewriting Kernel）に入る直前の最終防壁として、書き換え操作そのものの安全性を制御する **Self-Rewriting Safety Model Layer** の構造・型・契約（Blueprint）を定義します。
※ 本フェーズでは、実際の書き換え実行、構造変更、ランタイム制御は行わず、安全性モデルの論理定義のみを行います。

---

## 2. 3層防御の責務分離（厳守）

| Layer | Phase | 役割 | ディレクトリ |
|---|---|---|---|
| 評価 | Phase132 | 横断的監査エンジン（事後的・評価型） | `src/audit/` |
| 通過制御 | Phase142.5 | 進化操作の事前通過制御（ゲート型） | `src/auditgate/` |
| **書き換え制御** | **Phase142.6** | **書き換え実行そのものの安全性判定（許可制）** | **`src/safety/`** |

---

## 3. Proposed Changes

### [NEW] `docs/specifications/SelfRewritingSafetyModel.md`
### [NEW] `src/safety/SafetyStatus.ts`
### [NEW] `src/safety/SafetyType.ts`
### [NEW] `src/safety/RewriteCandidate.ts`
### [NEW] `src/safety/RewriteSafetyEngine.ts`
### [NEW] `src/safety/SafetyRegistry.ts`
### [NEW] `src/safety/SafetyManager.ts`
### [MODIFY] `src/index.ts`

---

## 4. Verification Plan
1. `npm run build` (tsc --noEmit)
2. `python3 tools/cie.py verify` / `doctor`
3. `.venv/bin/pytest`

---

## 5. Definition of Done
* [ ] 仕様書作成
* [ ] src/safety/* 作成
* [ ] index.ts 更新
* [ ] ビルド PASS
* [ ] CIE PASS
* [ ] Git commit & push
* [ ] HANDOVER 更新
