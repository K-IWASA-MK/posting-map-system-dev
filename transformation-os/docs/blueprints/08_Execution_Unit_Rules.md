# Transformation OS: 09_Execution_Unit_Rules

## 1. 概要 (Overview)
Transformation Contract が制定された後、Task Factory がどのように Execution Unit（実行最小単位）を生成するか、その絶対規則を定義する。

## 2. 1対1対応の原則 (One-to-One Mapping Rule)
**Execution Unit は AI によって自由に分割されるものではない。Contract Requirements と数学的な「1対1対応（完全一致）」を維持しなければならない。**

* `Contract Requirement R001` (Playwright Test) ➔ `Execution Unit EU001` (Playwrightを書く)
* `Contract Requirement R002` (Accessibility) ➔ `Execution Unit EU002` (ARIA属性追加)

これにより、AIが勝手に仕様を推測して仕事を増やしたり減らしたりする余地を完全に排除する。

## 3. Task（Execution Unit）生成禁止条件
Task Factory は以下の条件のいずれかに該当する場合、Task の生成を **即時ブロック** しなければならない。

1. **Contract 不在**: Transformation Contract が存在しない、または Locked 状態でない場合。
2. **Evidence 欠落**: Contract 内に検証可能な `evidence_requirements` が定義されていない場合。
3. **マッピング違反**: Contract の Requirement と Execution Unit が1対1で対応していない場合。
4. **憲法違反**: 憲法（特に Article 1, 2, 3）に抵触する内容が含まれている場合。

## 4. Task（Execution Unit）生成可能条件
以下の条件をすべて満たした場合のみ、Task Factory は Task を生成し、Task OS へディスパッチ（`READY` 状態への遷移）を行うことができる。

1. **Contract の完全性**: Contract が数学的・論理的に不備なく定義されていること。
2. **完全一致**: Contract Requirement と Execution Unit が完全に 1:1 でマップされていること。

---
**※Transformation OS は Architecture Driven Development を採用する。Blueprint が100%承認されるまで、いかなる実装も開始してはならない。**
