#!/bin/bash

# pre-deploy-simulation.sh
# 
# clasp push またはリリース、プロダクション環境へのデプロイ操作前に
# 品質ゲート（Simulation Test）の合格を自動検証するフックスクリプト。

# スクリプトがある場所からの相対パスで hook_runner.js を実行
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$DIR/hook_runner.js" "clasp-pre-deploy" "run-pre-deploy-check"

# フックランナーの終了ステータス（Exit Code）をそのまま返却
exit $?
