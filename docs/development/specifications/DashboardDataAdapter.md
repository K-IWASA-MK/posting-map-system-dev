# データアダプター仕様書 (Dashboard Data Adapter Specification)

## 目的
API から取得した JSON データを検証・正規化し、ダッシュボード制御ロジック（`Dashboard.js`）へ安全に受け渡す「`DashboardDataAdapter.js`」の機能・設計定義。

---

## データアダプターの責務定義 (Adapter Responsibilities)

### 1. JSON 取得 (Data Fetching)
- 指定されたデータソース境界設定（`DATA_SOURCE = MOCK` または `DATA_SOURCE = API`）に基づき、静的モックデータまたは API GET エンドポイント（`GET /api/dashboard/summary`）から非同期にデータを読み込む。

### 2. スキーマ確認 (Schema Validation)
- 取得した JSON レコードに対し、`DashboardKPISchema` に基づいて必須キー（`qualityScore`, `knowledgeTotal` 等）の存在を検証する。
- **欠損時エラー**: 必須キーが欠落している場合、検証結果ステータスを `Warning` に設定し、一部欠損をログに記録しつつ、欠損箇所にモック値をあてがう。

### 3. 正規化処理 (Normalize)
- 欠落した項目へのデフォルト値（Fallback Values）の補完、数値型のフォーマット調整を行い、UI 描画ロジックが安全に処理できるオブジェクト形式へ統一する。

---

## 異常系・エラーモデル (Error Model)
アダプターは、通信失敗または重大なスキーマ不整合を検出した場合、以下を内包するエラー結果オブジェクトを生成して呼び出し元へ戻す。
- `isSuccess`: `false` (API 接続失敗や重要項目全欠損時)
- `isWarning`: `true` (一部項目欠損でのフォールバック作動時)
- `errorMessage`: エラー原因を示す文字列
- `data`: 代替表示用のモックデータレコード
