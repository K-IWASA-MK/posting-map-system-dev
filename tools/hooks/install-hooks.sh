#!/bin/bash

# install-hooks.sh
# 
# 開発環境へ Git コミット品質ゲートフックを登録・配置するスクリプト。
# バイパスや強制パス用の例外設定は一切含まない。

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$DIR/../.." && pwd )"

HOOK_FILE="$REPO_ROOT/.git/hooks/pre-commit"

echo "[Hook Installer] Git品質ゲートフックを登録しています..."

# 1. .git/hooks/ ディレクトリの存在確認
if [ ! -d "$REPO_ROOT/.git/hooks" ]; then
  echo "[Error] .git/hooks ディレクトリが見つかりません。リポジトリルートで実行してください。"
  exit 1
fi

# 2. フックファイルのコピー・配置
cat << 'EOF' > "$HOOK_FILE"
#!/bin/sh
# AIOS Quality Gate Pre-Commit Hook

# tools/hooks/pre-commit-simulation.sh を実行
tools/hooks/pre-commit-simulation.sh
EOF

# 3. 実行権限の付与
chmod +x "$HOOK_FILE"

echo "[Hook Installer] 正常にフックファイルが配置されました: $HOOK_FILE"

# 4. フック配置監査イベントの追記 (Append-Only)
node -e "
const { AuditWriter } = require('$REPO_ROOT/src/simulation/AuditWriter');
AuditWriter.write('HOOK-INSTALL', 'HookInstalled', {
  hookType: 'git-pre-commit',
  targetPath: '$HOOK_FILE',
  timestamp: new Date().toISOString()
}).then(() => {
  console.log('[Hook Installer] インストール監査ログが正常に記録されました。');
}).catch(err => {
  console.error('[Error] 監査ログ記録に失敗しました:', err.message);
});
"
