# Health Model 仕様書

## 概要
本仕様書は、Runtime 単体の Health 情報と、プラットフォーム全体の状態を要約集約する「PlatformHealth」のデータモデルを定義します。

## 状態定義 (Health Status)
- **HEALTHY**: すべての Runtime が正常稼働中。
- **DEGRADED**: 1つ以上の非致命的警告、または一部の非コア Runtime で異常を検出。
- **UNHEALTHY**: 1つ以上のコア Runtime（Validation Runtime 等）で FAILED または UNHEALTHY を検出。
- **UNKNOWN**: 初期ブート時や情報不足により判定不可能な状態。

## 集約ルール (Aggregation Rule)
1. 個々の Runtime 状態を定期監査。
2. 状態（traces status）および Alert 履歴から、各 Runtime Health のマップを作成。
3. `runtimeHealths` 配列に `FAILED` または `UNHEALTHY` が含まれていれば、プラットフォーム全体の `PlatformHealth` は `UNHEALTHY` へ自動移行されます。
