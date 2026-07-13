# 🚨 緊急手順書 — Git履歴からシークレットを完全削除する

> **作成日**: 2026-05-19  
> **対象**: posting-map-system リポジトリ  
> **用途**: `.env` 等の機密情報を誤ってコミット・プッシュした場合の緊急対応

---

## ⚠️ この手順書を使う状況

以下のいずれかが発生した場合、**直ちに**この手順を実行すること：

- `.env` ファイルがGitにコミットされた
- `GEMINI_API_KEY` 等のシークレットがコード内にハードコードされてプッシュされた
- GitHub上のコミット履歴にAPIキーが見える

---

## 🔴 STEP 0: まず即座にAPIキーを無効化する

> **Git履歴の削除より先に行うこと。削除には時間がかかる。**

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 漏洩したAPIキーを **即座に削除（Revoke）**
3. 新しいAPIキーを発行し、`.env` に記入

---

## 🛑 STEP 1: リモートリポジトリを一時的にPrivateに変更

1. GitHub → リポジトリ → **Settings** → **Danger Zone**
2. **Change repository visibility** → **Private** に変更
3. 作業完了後、必要に応じてPublicに戻す

---

## 🔧 STEP 2: Git履歴からシークレットを完全削除

### 方法A: BFG Repo-Cleaner（推奨・高速）

```bash
# 1. BFGをインストール（Homebrewの場合）
brew install bfg

# 2. プロジェクトのベアクローンを作成
cd /tmp
git clone --mirror git@github.com:YOUR_USERNAME/posting-map-system.git

# 3. .envファイルをすべての履歴から削除
bfg --delete-files .env posting-map-system.git

# 4. 履歴をクリーンアップ
cd posting-map-system.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. 強制プッシュ（⚠️ 全ブランチに影響）
git push --force
```

### 方法B: git filter-branch（BFGが使えない場合）

```bash
# プロジェクトルートで実行
cd /Volumes/SSD_DATA/posting-map-system

# .envをすべての履歴から削除
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# ローカルの参照をクリーンアップ
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 強制プッシュ
git push origin --force --all
git push origin --force --tags
```

### 方法C: 緊急スクリプト（自動化）

```bash
# scripts/remove_env_from_git.sh を実行
bash posting_map/10_docs/security/scripts/remove_env_from_git.sh
```

---

## ✅ STEP 3: 完了確認

```bash
# 履歴に .env が残っていないか確認
git log --all --full-history -- .env

# シークレット文字列が残っていないか検索
git grep "GEMINI_API_KEY" $(git rev-list --all)
```

上記コマンドが **何も出力しなければ削除完了**。

---

## 📋 STEP 4: チームへの通知

- [ ] コラボレーター全員に「強制プッシュを行った」と通知
- [ ] 各自がローカルリポジトリを `git fetch --all` + `git reset --hard origin/main` で更新するよう依頼
- [ ] 新しいAPIキーを安全な方法（1Password等）で共有

---

## 🛡️ 再発防止策

| 対策 | 状態 |
|------|------|
| `.gitignore` に `.env` を追加 | ✅ 設定済み |
| `pre-commit` フック（シークレット検出） | 🔲 任意で追加 |
| GitHub Secret Scanning 有効化 | 🔲 推奨 |
| `.env.example` でテンプレート管理 | 🔲 任意で追加 |

---

> 📞 **緊急連絡**: シークレット漏洩の疑いがある場合は、まず**APIキーの無効化**を最優先で実行すること。
