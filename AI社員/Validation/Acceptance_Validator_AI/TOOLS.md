# Tools Specification: Acceptance Validator AI

本ドキュメントは、Acceptance Validator AI が検査業務で使用するツールおよび禁止ツールを規定する。

## 許可ツール群 (Allowed Verification Tools - Read-Only)

1. **`SHA-256 Hash Engine`**:
   - 用途: 成果物ファイルの SHA-256 チェックサム計算および非改ざん性比較。
   - モード: Read-Only (ファイルハッシュ読み取りのみ)

2. **`CSV Stream Parser`**:
   - 用途: 1自治体1行形式の検証、ヘッダー構文チェック、行数カウント。
   - モード: Read-Only (読み取り専用構文解析)

3. **`JSON Schema Validator`**:
   - 用途: `verification.json` およびログファイルのスキーマ適合性検証。
   - モード: Read-Only (スキーマ検証のみ)

4. **`Drive Directory Inspector`**:
   - 用途: `03_BRANCH` 配下のディレクトリ構造存在チェック。
   - モード: Read-Only (ディレクトリ検索のみ)

---

## 🚫 禁止ツール群 (Strictly Forbidden Tools)

- ✖ **`File Writer / Mutator`**（成果物ファイルの書き換え・上書きツール）
- ✖ **`File Remover / Deleter`**（ファイル・フォルダ削除ツール）
- ✖ **`Drive Uploader / Creator`**（ドライブ上のフォルダ生成・再アップロードツール）
- ✖ **`Web Scraper / Fetcher`**（公的サイトからの情報再取得ツール）
- ✖ **`LLM Text Generator / Auto-Fixer`**（文章自動生成・自動修復ツール）
