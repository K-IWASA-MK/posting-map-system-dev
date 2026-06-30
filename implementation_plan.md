# Implementation Plan - Foundation Fix Pack v1

CIE Foundation の基礎構造（Phase 16 - 90）において指摘された優先度Aの品質改善課題を安全に適用するための実装計画です。

## User Review Required

> [!IMPORTANT]
> 本作業は新規のフェーズ（Phase 91）ではなく、**Phase 91 開始前の「品質改善（Fix Pack）」**として位置づけられます。
> 既存の JSON 成果物の互換性およびランタイム Blueprint 仕様を一切変更せず、シリアライズ保証とテストスイートの新設による堅牢性の向上のみを行います。
> 岩佐CEOからの **「GO」** のご指示をいただくまで、コードの変更やコマンドの適用、Git 操作は一切開始いたしません。

---

## Fix Pack v1 のゴールと目的
**「Foundation の正しさを証明する」**
本 Fix Pack は実装コードを肥大化させるためのものではなく、プラットフォーム基礎部分の等価性（シリアライズ）とマネージャの動作基準を厳格にテスト保証するための「品質向上フェーズ」です。

---

## 課題定義 (Priority A)

### ① Serialization Round Trip 修正 (等価比較仕様の限定化)
* **設計変更**:
  * 設計が肥大化する `__eq__` メソッドの追加は見送り（対象から除外）。
  * Round Trip 整合性の保証は `to_dict() == to_dict()` （つまり、`assert obj.to_dict() == reconstructed.to_dict()`）の比較で十分とします。
* **段階的復元 (Shallow Restoration) の徹底**:
  * 深い層までの完全な再帰的復元は将来的な変更に対して危険なため行いません。
  * `from_dict` においては、対象の親オブジェクトデータが `dict` である場合のみ、1階層下の親 DTO の `from_dict()` を呼び出す安全な一段階復元（Shallow Restoration）に留めます。
    ```python
    # 段階的復元例
    parent_data = data.get("parent")
    if isinstance(parent_data, dict):
        parent_obj = ParentDTO.from_dict(parent_data)
    ```

### ② DTO Unit Test 追加 (`tests/test_serialization.py` - 新設)
* **テスト内容**:
  * 全 DTO について、`obj -> to_dict() -> from_dict() -> to_dict()` を通したシリアライズ結果の一致を検証。
  * `assert obj.to_dict() == reconstructed.to_dict()` を用いてアサーション。

### ③ Manager Unit Test 追加 (`tests/test_manager.py` - 新設)
* **テスト内容**:
  * 入力 DTO の内容が破壊（書き換え）されていないこと。
  * 出力生成時に `metadata.copy()` が正しく適用されていること。
  * 同一の入力に対して常に同一の出力を返すこと (`Deterministic`)。
  * 状態を持たないこと (`Stateless`)。
  * **【追加】入力 DTO と出力 DTO が同一のオブジェクト参照ではないこと（`assert input is not output` の検証）**。

### ④ Foundation Audit 強化
* **監査拡張**:
  * `tools/cie.py` の `audit-foundation` コマンドに `serialization` の監査項目を追加。
  * 監査結果に `serialization: PASS` を追加し、結果表示・保存の表示順序を以下で固定します。
    1. `architecture`
    2. `dto`
    3. `manager`
    4. `serialization`
    5. `runtime_foundation`
    6. `cli`
    7. `overall`

---

## 今回「絶対に実施しない」もの
以下の項目は本 Fix Pack v1 では一切触れず、Phase 91 以降で段階的に検討・実施します。
* CLI分割
* Command Registry
* Namespace整理
* Base Mapper
* Dataclass化 / Frozen Dataclass化
* Execution Scope の導入

---

## 変更対象ファイル一覧

| パッケージ / ディレクトリ | 対象ファイル | 変更内容 |
|---|---|---|
| `plugin_platform/plugin/` | 各種 DTO 定義ファイル（`*.py`） | `from_dict` クラスメソッドの段階的復元対応（`__eq__` 実装は対象外） |
| `tools/` | [cie.py](file:///Volumes/SSD_DATA/posting-map-system/tools/cie.py) | `audit-foundation` の監査項目追加と順序固定、`foundation_audit.json` へのシリアライズ結果配線 |
| `tests/` [NEW] | `test_serialization.py` | 全 DTO に対する `to_dict()` 同士の Round Trip 検証 |
| `tests/` [NEW] | `test_manager.py` | 全 Manager に対する `is not` オブジェクト参照比較を含む等価検証 |

---

## 影響範囲

* **影響が及ぶ範囲**:
  * CIE プラットフォーム上の DTO シリアライズ構成フロー。
  * `audit-foundation` コマンドの出力形式および順序（`foundation_audit.json` に `serialization` フィールドが追加され、固定順序で並び替わります）。
* **影響が及ばない範囲**:
  * 既存の JSON 成果物の内部構造（キーやバリュー自体のフォーマット変更はなし）。
  * 既存の PWA（フロントエンド）や GAS API のコード。

---

## Verification Plan (検証計画)

実装完了後、以下のテストがすべて `PASS` することを確認します。

### 1. pytest による単体テスト実行
```bash
pytest tests/
```
* `test_serialization.py` および `test_manager.py` が正常合格することを確認。

### 2. CIE Audit コマンド実行
```bash
python3 tools/cie.py audit-foundation
```
* 監査結果のターミナル出力で `Serialization Audit : PASS` と表示され、固定順序で並んでいることを確認。
* `tools/plugins/foundation_audit.json` に `"serialization": "PASS"` が追加されていること。

### 3. CIE 健全性検証コマンド
```bash
python3 tools/cie.py verify
python3 tools/cie.py doctor
```
* 既存の JSON 成果物の整合性テストでエラーが発生しないこと。

---

## リスクと対策

* **リスク**: 1階層下の `from_dict` を呼び出す際、データが `dict` 型ではない場合に意図しないパースエラーが起こる可能性。
* **対策**: `isinstance(data, dict)` による型アサーション・ガード節をすべての段階的復元ポイントに埋め込み、安全にハンドリングする。

---

## 完了条件

* [ ] `pytest tests/` にて、Round Trip Test および Manager Test がすべて `PASS`
* [ ] `python3 tools/cie.py verify` が `PASS`
* [ ] `python3 tools/cie.py doctor` が `PASS`
* [ ] `python3 tools/cie.py audit-foundation` が `PASS`
* [ ] `foundation_audit.json` の `summary` 内に `"serialization": "PASS"` が存在すること
* [ ] 表示結果順序が規定通りに固定されていること
* [ ] 既存 JSON の構造や互換性を壊していないこと
