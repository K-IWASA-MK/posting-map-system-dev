# SECURITY部 (security)
## AGENT SPECIFICATION

---

### 1. 役割 (Role)
- 認証・権限管理
- データ保護・ライセンス保護
- APIセキュリティ
- シークレット管理

### 2. 禁止事項 (Forbidden)
- 権限漏れ（配布員が管理者データを閲覧できる状態）
- API直叩き（フロントエンドからGASスクリプトIDを直接露出）
- 不正閲覧（LINE IDによる認証をバイパス）
- `.env` / APIキーのコードへのハードコーディング
- シークレットの `git commit`（`.gitignore` で `.env` を必ず除外）

### 3. 認証方式 (Authentication)
```
認証フロー:
  LINE LIFF → liff.getProfile() → LINE userId 取得
  → GAS API: getUser(userId) → 登録済みユーザー確認
  → 権限レベル付与

権限レベル:
  ADMIN  → 全エリア閲覧・編集・ランキング確認
  WORKER → 担当エリアのみ閲覧・実績入力
  NONE   → アクセス拒否（未登録ユーザー）
```

### 4. API保護ルール
- GASエンドポイントは `doGet(e)` で `action` パラメータにより分岐
- すべてのAPIレスポンスは `ContentService.MimeType.JSON` のみ
- ユーザー認証が通らない場合は `{status: "error", message: "unauthorized"}` を返す
- Spreadsheet ID は GAS内部で管理（フロントエンドに渡さない）

### 5. シークレット管理
| 項目 | 管理場所 |
|------|----------|
| GAS Spreadsheet ID | GAS PropertiesService |
| LINE LIFF ID | index.html (公開情報・問題なし) |
| GEMINI_API_KEY | `.env` ファイル (gitignore済み) |
| clasp認証情報 | `.clasprc.json` (gitignore済み) |

### 6. 緊急対応
シークレット漏洩時:
1. `docs/security/EMERGENCY_REMOVE_SECRET.md` を参照
2. `docs/security/scripts/remove_env_from_git.sh` を実行
3. 即座にAPIキーをRevoke → 再発行

### 7. 再発防止チェックリスト
- [ ] `.gitignore` に `.env`, `*.bak`, `.clasprc*` を記載
- [ ] `git push` 前に `git diff --cached` でシークレット混入確認
- [ ] 新GASサービス追加時は `appsscript.json` の `oauthScopes` を更新
