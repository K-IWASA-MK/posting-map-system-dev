# Address Extraction AI - WORKFLOW Specification

Version: 1.0.0
Agent Name: Address Extraction AI

---

## ■ Execution Sequence (実行シーケンス)

```
1. Input Verification (入力正本読み込み)
   └─ master/district_profile.json を読み込み、構成自治体リストを取得

2. Master Lookup & Filtering (全国住所マスター照合・抽出)
   └─ 既存の全国住所マスターから構成自治体と一致する住所レコードを抽出

3. Normalization & Deduplication (正規化・名寄せ・重複除去)
   └─ 表記ゆれ（全角半角、ハイフン、旧字体）を正規化し、ユニーク町丁目リストを作成

4. Master Persistence (正本保存)
   └─ 自らが所有権を持つ master/address_database.json へ書き込み保存

5. Audit Log Generation (監査ログ生成)
   └─ logs/verification.json を生成保存

6. Acceptance Validation (品質保証検査)
   └─ Acceptance Validator AI による 5-Gate 検査を通過し成功判定を得る
```
