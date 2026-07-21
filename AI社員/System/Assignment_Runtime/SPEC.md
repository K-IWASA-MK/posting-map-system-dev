# Assignment Runtime Foundation v1.0 - SPEC Specification

System: POSTING MAP / FIELD OPERATIONS OS
Author: 岩佐CEO / AI Director
Status: STABLE RELEASE (v1.0.0)

---

## ■ Mission (目的)
`AI Workforce Constitution v1.3.0` に基づき、AI社員へ仕事（Task）を安全・決定論的・非侵襲的に割り当てる Assignment Runtime の設計仕様。

---

## ■ Key Principles (遵守原則)
1. **Blueprint First**: 意図しないサイドエフェクトを遮断。
2. **Capability Matching**: `EMPLOYEE.json` の `capabilities` と要求能力の一致を厳格検証。
3. **Ownership Guard**: `ownedArtifacts` / `producedArtifacts` の所有者以外への更新割り当てを絶対拒否。
4. **Deterministic Allocation**: 確定的なアルゴリズムによる割り当て判定。
