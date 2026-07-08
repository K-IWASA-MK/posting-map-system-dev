#!/bin/bash

# pre-commit-simulation.sh
# 
# Git Commit 前に品質ゲート（Simulation Test）の合格を自動検証するフックスクリプト。
# バイパス（--no-verify）を自動で推奨・強制適用する設計は持たない。

# スクリプトがある場所からの相対パスで hook_runner.js を実行
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$DIR/hook_runner.js" "git-pre-commit" "test-kernel-simulation"

# フックランナーの終了ステータス（Exit Code）をそのまま返却
exit $?
