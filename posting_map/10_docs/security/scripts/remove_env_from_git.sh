#!/usr/bin/env bash
# ============================================================
# 🚨 EMERGENCY: Git履歴から .env を完全削除するスクリプト
# ============================================================
# 使用方法:
#   chmod +x remove_env_from_git.sh
#   bash remove_env_from_git.sh          # dry-run（確認のみ）
#   bash remove_env_from_git.sh --execute # 実際に実行
# ============================================================

set -euo pipefail

# ── 色定義 ──────────────────────────────────────────────────
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── 引数チェック ─────────────────────────────────────────────
EXECUTE=false
if [[ "${1:-}" == "--execute" ]]; then
  EXECUTE=true
fi

# ── ヘッダー ─────────────────────────────────────────────────
echo ""
echo -e "${RED}${BOLD}============================================================${RESET}"
echo -e "${RED}${BOLD}  🚨 EMERGENCY: Git Secret Removal Script${RESET}"
echo -e "${RED}${BOLD}============================================================${RESET}"
echo ""

if [[ "$EXECUTE" == false ]]; then
  echo -e "${YELLOW}⚠️  DRY-RUN モード（実際の変更は行いません）${RESET}"
  echo -e "${YELLOW}   実行するには: bash $0 --execute${RESET}"
  echo ""
fi

# ── 作業ディレクトリ確認 ────────────────────────────────────
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [[ -z "$REPO_ROOT" ]]; then
  echo -e "${RED}❌ Gitリポジトリが見つかりません。リポジトリ内で実行してください。${RESET}"
  exit 1
fi
echo -e "${CYAN}📁 リポジトリルート: ${REPO_ROOT}${RESET}"

# ── STEP 0: APIキー無効化の確認 ─────────────────────────────
echo ""
echo -e "${RED}${BOLD}STEP 0: APIキーを無効化しましたか？${RESET}"
echo -e "  👉 https://aistudio.google.com/app/apikey"
echo ""
if [[ "$EXECUTE" == true ]]; then
  read -p "  APIキーの無効化が完了している場合は 'yes' を入力: " CONFIRM
  if [[ "$CONFIRM" != "yes" ]]; then
    echo -e "${RED}❌ 中断しました。先にAPIキーを無効化してください。${RESET}"
    exit 1
  fi
fi

# ── STEP 1: 現状確認 ────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}STEP 1: .env の Git履歴を確認中...${RESET}"
echo ""

ENV_HISTORY=$(git log --all --full-history --oneline -- .env 2>/dev/null || echo "")
if [[ -z "$ENV_HISTORY" ]]; then
  echo -e "${GREEN}✅ .env はGit履歴に存在しません。対応不要です。${RESET}"
  exit 0
else
  echo -e "${RED}🔴 以下のコミットに .env が含まれています:${RESET}"
  echo "$ENV_HISTORY"
fi

# ── STEP 2: BFG / filter-branch の選択 ──────────────────────
echo ""
echo -e "${CYAN}${BOLD}STEP 2: 削除ツールを選択...${RESET}"

if command -v bfg &>/dev/null; then
  TOOL="bfg"
  echo -e "${GREEN}✅ BFG Repo-Cleaner が見つかりました（推奨）${RESET}"
else
  TOOL="filter-branch"
  echo -e "${YELLOW}⚠️  BFG が未インストール → git filter-branch を使用${RESET}"
  echo -e "   (BFGのインストール: brew install bfg)"
fi

# ── STEP 3: 実行 ────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}STEP 3: Git履歴から .env を削除${RESET}"

if [[ "$EXECUTE" == true ]]; then
  cd "$REPO_ROOT"

  if [[ "$TOOL" == "filter-branch" ]]; then
    echo -e "${YELLOW}  git filter-branch を実行中...${RESET}"
    git filter-branch --force --index-filter \
      'git rm --cached --ignore-unmatch .env' \
      --prune-empty --tag-name-filter cat -- --all

    echo -e "${YELLOW}  参照をクリーンアップ中...${RESET}"
    git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin || true
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive

    echo -e "${GREEN}✅ ローカル履歴のクリーンアップ完了${RESET}"
  else
    echo -e "${YELLOW}  BFGはベアクローンが必要です。手動手順を参照してください:${RESET}"
    echo -e "  📄 EMERGENCY_REMOVE_SECRET.md の STEP 2 → 方法A"
  fi

  # ── STEP 4: 強制プッシュ確認 ────────────────────────────
  echo ""
  echo -e "${RED}${BOLD}STEP 4: リモートに強制プッシュ${RESET}"
  echo -e "${RED}  ⚠️  全コラボレーターのローカルリポジトリに影響します！${RESET}"
  echo ""
  read -p "  強制プッシュを実行しますか？ (yes/no): " PUSH_CONFIRM
  if [[ "$PUSH_CONFIRM" == "yes" ]]; then
    git push origin --force --all
    git push origin --force --tags
    echo -e "${GREEN}✅ 強制プッシュ完了${RESET}"
  else
    echo -e "${YELLOW}⏸️  プッシュをスキップしました。手動で実行してください:${RESET}"
    echo -e "   git push origin --force --all"
  fi

else
  echo -e "${YELLOW}  [DRY-RUN] 以下のコマンドが実行されます:${RESET}"
  echo ""
  echo "  git filter-branch --force --index-filter \\"
  echo "    'git rm --cached --ignore-unmatch .env' \\"
  echo "    --prune-empty --tag-name-filter cat -- --all"
  echo ""
  echo "  git reflog expire --expire=now --all"
  echo "  git gc --prune=now --aggressive"
  echo "  git push origin --force --all"
fi

# ── 完了確認 ─────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}✅ 完了確認コマンド:${RESET}"
echo "  git log --all --full-history -- .env"
echo "  git grep 'GEMINI_API_KEY' \$(git rev-list --all) 2>/dev/null || echo 'clean'"
echo ""
echo -e "${GREEN}${BOLD}============================================================${RESET}"
echo -e "${GREEN}${BOLD}  作業完了。EMERGENCY_REMOVE_SECRET.md の手順も確認してください。${RESET}"
echo -e "${GREEN}${BOLD}============================================================${RESET}"
echo ""
