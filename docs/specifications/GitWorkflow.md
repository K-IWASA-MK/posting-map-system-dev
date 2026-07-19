# Git 運用ワークフロー (Git Workflow)

## 概要
本仕様書は、AIOS プラットフォーム開発における Git 運用の基準を定義します。コードの品質維持と衝突回避のため、すべてのコミットおよびプッシュは本仕様に従って実行されなければなりません。

## コミット前提条件 (Commit Pre-conditions)
Git Commit を実行する前に、以下の項目が**すべて成功 (PASS)** していなければなりません。いずれか1つでも失敗した状態でのコミットは厳格に禁止されます。

1. **Build Success**: TypeScript/JavaScript ビルドがエラーなしで完了すること（`npm run build`）。
2. **Lint Success**: リンターによる静的解析エラーがないこと。
3. **Unit Test Success**: すべてのユニットテストが成功すること。
4. **Architecture Check Success**: レイヤー境界およびインポート規則のチェックが成功すること（`npm run architecture:test`）。
5. **Dependency Check Success**: 依存関係スキャナーの検証をパスしていること。
6. **SDK Boundary Check Success**: アプリケーションからプラットフォーム内部への直接参照がないこと。
7. **Quality Gate Pass**: 定義された品質基準（Quality Gate）を完全にクリアしていること。

## プッシュ前提条件 (Push Pre-conditions)
Git Push を実行する前に、以下の状態であることを確認しなければなりません。

1. **Commit 完了**: 変更対象コードのコミットがローカルで正常に完了していること。
2. **Working Tree Clean**: ローカルの作業ディレクトリに変更中の未コミットファイルが存在しないこと（`git status` がクリーンであること）。
3. **Branch Validation**: プッシュ対象のブランチ名が命名規則に沿っており、正しい追跡ブランチが設定されていること。
4. **Remote Validation**: プッシュ先のリモートリポジトリ（特に開発用の `origin-dev`）が正しく設定されていること。
5. **Version Validation**: リリース内容に対応するバージョン表記（`package.json` やメタデータ）が正しく更新されていること。

## プッシュ後の必須作業 (Post-Push Operations)
Git Push の実行が正常に完了した後、以下のタスクを順番に実行します。

1. **Push Success の確認**: リモートリポジトリへのプッシュが正常に受け入れられたことを確認します。
2. **Completion Report 作成**: コミットハッシュ、ビルド・テスト結果、プッシュ先を記載した完了報告を作成します。
3. **HANDOVER.md 更新**: 開発状況の最新ステートを `HANDOVER.md` に記録します。
4. **CHANGELOG / RELEASE_NOTES 更新**: 必要に応じて変更ログを更新します。
5. **Release Tag 判定**: タグの付与が必要なマイルストーンに到達したか判定し、必要に応じて Git Tag を発行します。

## 🚨 リモート使い分けルール (開発用リモートの徹底)
- **開発・変更時のプッシュ**: 常に `origin-dev`（例: `K-IWASA-MK/posting-map-system-dev`）に対してのみプッシュを行います。
- **本番用リモート (`origin`) の保護**: `origin` リポジトリは安定版バックアップ用として保管し、開発AIによる直接のプッシュは一切禁止とします。
