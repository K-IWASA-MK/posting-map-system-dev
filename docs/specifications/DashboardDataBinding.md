# データバインディング仕様書 (Dashboard Data Binding Specification)

## 概要 (Overview)
本仕様書は、AIOS Dashboard における読み取り専用（GETのみ）のデータ接続およびマッピングに関わるバインディング境界を定義する。

---

## 読み取り専用境界 (Read-Only Boundary & Constraints)
ダッシュボードは AIOS の出力を観測するだけの「Mission Control View」であり、状態や設定の変更機能は一切持たない。
- **GET メソッドへの限定**:
  - API からデータを取得する通信は `GET` メソッドのみを許可する。
  - `POST`, `PUT`, `PATCH`, `DELETE` を用いたリクエスト送信コードは、システム全体で実装・実行を厳格に禁止する。
- **操作権限の完全な排除**:
  - UI 上から Kernel を実行させたり、認可ステータスを更新させたりする機能の組み込みは一切行わない。

---

## エラー処理とフォールバック (Error Handling & Fallback Strategy)
ネットワーク接続障害や API 応答の不備が発生した際も、ダッシュボードはクラッシュせずに正常に稼働を継続する。
1. **フォールバックデータ (Fallback to Mock)**:
   - API リクエストが失敗した場合、ローカルの `MOCK_DASHBOARD_DATA` を代替表示用として自動ロードする。
2. **警告インジケーター (Warning Display)**:
   - フォールバックデータで表示している場合は、UI 上に「Warning: Using Offline Fallback Data」の警告ラベルを表示する。
3. **自動修復の禁止**:
   - エラーを検知した際、ダッシュボード側で自動的な再実行や設定の書き換え、修復プロセスのトリガーを起動してはならない。
