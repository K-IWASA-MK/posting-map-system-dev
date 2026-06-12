# コーディング標準 & GAS最適化ルール (rules/coding_standards.md)

本ドキュメントは、POSTING MAP開発におけるコーディングおよびGoogle Apps Script (GAS) 制御の共通ルールを定義します。作業AIおよび開発者は本ルールを厳格に遵守してください。

---

## 1. フロントエンド標準 (HTML / Javascript / CSS)

### 1.1 基本技術スタック
* **HTML**: セマンティックHTML5を必須とします（`<header>`, `<nav>`, `<main>`, `<footer>`等）。
* **Javascript**: Vanilla JS (純粋なJavaScript) を使用し、無用なフレームワークや巨大なライブラリの読み込みを避けます。
* **CSS**: Vanilla CSSを使用します。UIは漆黒（#000000）ベースの極上ガラスUI（iOS/Android対応）とします。

### 1.2 クライアント別設定の分離 (Case C方針)
* ロジックコード（`app.js`等）内に、特定の `LIFF ID`、`GASのURL`、`CSVファイル名` などの環境依存の値を直接記述（ハードコーディング）してはなりません。
* すべての環境依存値は、クライアントごとの設定ファイル（`clients/[CLIENT_ID]/config.js`）に定義し、アプリ起動時に動的に読み込みます。

---

## 2. GAS (Google Apps Script) 開発標準

### 2.1 高速化とAPI制限対策
GASの実行速度向上とAPI制限回避のため、以下のルールを徹底してください。

* **セルの個別取得・書き込み禁止**:
  ```javascript
  // ❌ 禁止例 (ループ内での個別アクセス)
  for (let i = 0; i < 100; i++) {
    sheet.getRange(i + 1, 1).setValue(value);
  }

  // ✅ 推奨例 (一括取得・一括書き込み)
  const values = range.getValues();
  // 処理...
  sheet.getRange(1, 1, newValues.length, newValues[0].length).setValues(newValues);
  ```
* **getLastRow() / getLastColumn() の乱用禁止**:
  `getLastRow()` は呼び出すたびにスプレッドシートへの通信が発生し低速化の原因になります。取得は必要最低限（1回）にし、可能な限りローカル配列の長さ（`.length`）で計算してください。
* **JSONレスポンスの徹底**:
  GASは純粋なAPIサーバーとして動作させます。`HtmlService` を用いたHTMLレンダリングやリダイレクトは行わず、必ずJSONのみを返却してください。
  ```javascript
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  ```

---

## 3. キャッシュ (CacheService) の活用ルール
* アプリ全体のロード時間（目標3秒以内）を達成するため、頻繁に変更されないデータ（マスタデータ、ランキング等）は `CacheService` またはスクリプトプロパティを用いて一時保存（キャッシュ）し、毎回スプレッドシートを読みに行かないように設計してください。
