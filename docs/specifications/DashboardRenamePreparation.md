# Dashboard リネーム影響範囲調査結果 (Dashboard Rename Preparation)

## 概要
本ドキュメントは、AIOS v6.0 Phase 2 で実施された Domain Isolation 検証において、AIOS Core 内から検出された `Dashboard` 関連のキーワードを含むファイルおよび影響範囲をリスト化したものです。これらのファイルおよびシンボルは、Phase 3 において `Console` または `Monitor` へと完全にリネーム・リファクタリングされます。

## リファクタリング対象ファイル一覧
計 10 件

1. [DashboardManifest.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/DashboardManifest.ts) (`sdk/core/dashboard/DashboardManifest.ts`)
2. [DashboardPolicy.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/DashboardPolicy.ts) (`sdk/core/dashboard/DashboardPolicy.ts`)
3. [DashboardRegistry.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/DashboardRegistry.ts) (`sdk/core/dashboard/DashboardRegistry.ts`)
4. [DashboardRuntime.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/DashboardRuntime.ts) (`sdk/core/dashboard/DashboardRuntime.ts`)
5. [DashboardState.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/DashboardState.ts) (`sdk/core/dashboard/DashboardState.ts`)
6. [DashboardLedger.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/ledger/DashboardLedger.ts) (`sdk/core/dashboard/ledger/DashboardLedger.ts`)
7. [DashboardMetricsCollector.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/metrics/DashboardMetricsCollector.ts) (`sdk/core/dashboard/metrics/DashboardMetricsCollector.ts`)
8. [DashboardServices.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/services/DashboardServices.ts) (`sdk/core/dashboard/services/DashboardServices.ts`)
9. [EventSubscriber.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/dashboard/services/EventSubscriber.ts) (`sdk/core/dashboard/services/EventSubscriber.ts`)
10. [LearningSource.ts](file:///Volumes/SSD_DATA/AI Development OS/sdk/core/learning/models/LearningSource.ts) (`sdk/core/learning/models/LearningSource.ts`)

## 影響範囲と移行設計案
- **`DashboardRegistry.ts`** ➔ **`MonitorRegistry.ts`** / **`ConsoleRegistry.ts`**
- **`DashboardRuntime.ts`** ➔ **`MonitorRuntime.ts`** / **`ConsoleRuntime.ts`**
- **`DashboardState.ts`** ➔ **`MonitorState.ts`**
- **`DashboardPolicy.ts`** ➔ **`MonitorPolicy.ts`**
- **`DashboardLedger.ts`** ➔ **`MonitorLedger.ts`**
- **`DashboardServices.ts`** ➔ **`MonitorServices.ts`**
- **`DashboardMetricsCollector.ts`** ➔ **`MonitorMetricsCollector.ts`**

これらの名称変更に伴い、SDK から公開されている型定義および re-export も変更されます。
