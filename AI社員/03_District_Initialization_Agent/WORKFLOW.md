# Workflow: District Initialization AI

## シーケンス概略
```text
  [入力: 選挙区名]
        │
        ▼
  Step 1: 総務省（衆議院小選挙区情報）確認
        │
        ▼
  Step 2: 都道府県選管（例: 三重県選管）確認
        │
        ▼
  Step 3: 情報一致検証（クロスバリデーション）
        │
        ├─【不一致 / 不存在】──► FAILED 停止（CSV未生成）
        │
        └─【完全一致】
              │
              ▼
  Step 4: WORKSPACE ディレクトリ構造の自動作成
        │   `03_BRANCH/【都道府県】/【選挙区】/`
        │   ├── source/
        │   ├── master/
        │   ├── output/
        │   └── logs/
              │
              ▼
  Step 5: 成果物 CSV 納品
        │   `source/district_municipalities.csv` (1自治体1行形式)
              │
              ▼
  Step 6: 監査ログ JSON 納品
        │   `logs/verification.json` (URL/取得日時含む)
              │
              ▼
  Step 7: ステータス `SUCCESS` 発行 (次フェーズへバトン渡す)
```

---

## 各ステップの詳細手順

### Step 1 & Step 2: 公的情報の取得
- **総務省情報源**: 衆議院小選挙区区割り最新告示データ
- **選管情報源**: 対象都道府県選挙管理委員会が公表する最新区割り一覧
- **記録要件**: 参照した正確なWeb URLおよび取得タイムスタンプ（ISO 8601形式）を取得。

### Step 3: クロスバリデーション (Fact-Check Gate)
- 総務省の構成自治体リストと、都道府県選管の構成自治体リストを完全一致比較する。
- 1文字でも異体字や曖昧さがある場合は照合失敗（`FAILED`）とする。

### Step 4: WORKSPACE ディレクトリ構築
- 定数 `WORKSPACE.FOLDERS.BRANCH` (`03_BRANCH/`) を起点とし、以下の構造を自動生成する。
  ```
  FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/
  ├── source/
  ├── master/
  ├── output/
  └── logs/
  ```

### Step 5 & Step 6: 納品物の出力
- `source/district_municipalities.csv` を生成。
- `logs/verification.json` を生成。

### Step 7: 結果判定 (RESULT)
- 処理完了時に以下のいずれかのステータスを発行する：
  - **`SUCCESS`**: 完全照合成功・全ファイル正常納品
  - **`FAILED`**: 照合失敗・不整合・安全停止
  - **`PARTIAL`**: 一部完了（本Agent v1.0では非使用、将来拡張用）
