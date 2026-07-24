# Browser Runtime Foundation Specification

**Standard Identifier**: `AIOS-STD-FOUNDATION-008`  
**Title**: Browser Runtime Foundation Standard  
**Version**: 1.0  
**Author**: 岩佐CEO / AIOS Architecture Board  
**Classification**: AIOS Core Runtime Foundation (AI Employees Browser OS)  
**Status**: APPROVED & ACTIVE  

---

## 1. 目的と概要 (Purpose & Overview)

本仕様書は、AIOS Generation 9 において AI 社員（District Initialization Agent, Traffic Agent 等）が自律的かつ安全にブラウザ環境を操作し、Runtime Verification を実行するための共通ブラウザ実行基盤 **`Browser Runtime Foundation`** のアーキテクチャ、コンポーネント構造、規則、型定義、パブリック API、および拡張ロードマップを定める。

本 Foundation は、「単なるブラウザ操作ライブラリ」ではなく、**AI 社員がブラウザを利用するための共通 OS (Browser Execution OS)** として機能し、ブラウザ起動、CDP 接続、プロファイル隔離、セッション状態自動判定、監視メトリクス収集、不変証跡（Runtime Evidence）生成をカプセル化する。

---

## 2. アーキテクチャと 15 大コアコンポーネント (Architecture & Components)

```
                                    [AI Employee / Agent]
                                              │
                                   [BrowserRuntime (Facade)]
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   ▼                          ▼                          ▼
       [BrowserAdapter (Abstraction)] [BrowserRuntimePolicy]   [BrowserEvents (EventBus)]
                   │                          │                          │
                   ▼                          ▼                          ▼
          [ChromeCDPAdapter]       [BrowserHealthMonitor]       [BrowserSessionManager]
                   │                          │                          │
       ┌───────────┴───────────┐              ▼                          ▼
       ▼                       ▼    [BrowserRuntimeMetrics]    [BrowserSessionModel]
[ChromeProcessManager] [CDPConnectionManager]                            │
       │                       │                                         ▼
       ▼                       ▼                            [LINE / Google / Cookies]
[BrowserProfileManager] [BrowserContextManager]
       │                       │
       ▼                       ▼
[POSTING MAP Profile]  [BrowserPageManager]
                               │
                               ▼
                   [RuntimeEvidenceCollector]
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
[ScreenshotCollector]   [ConsoleCollector]      [NetworkCollector]
       │                       │                       │
       ▼                       ▼                       ▼
[DOMCollector]          [TraceCollector]     [RuntimeEvidenceModel]
```

---

## 3. 5 大厳格ルール (Inviolable Foundation Rules)

| ルール ID | ルール名称 | 概要・要求仕様 |
|---|---|---|
| **Rule BR-001** | **CDP First Rule** | CDP Endpoint (例: `ws://localhost:9222`) が利用可能な場合、新規 Chrome 起動を厳禁とし `connectOverCDP()` を最優先使用する。CDP 不可時のみ `Launch Browser` へフォールバックする。 |
| **Rule BR-002** | **Profile Isolation Rule** | AI 社員は指定された「`POSTING MAP Profile`」のみ利用可能。人間経営者の「`CEO Browser Profile`」へのアクセスおよび干渉は憲法上固く禁止される。 |
| **Rule BR-003** | **Session Verification Rule** | `BrowserSessionManager` は Runtime Verification 開始前に LINE, Google, Cookie, Storage のセッション状態を事前アサートし、有効性を検証する。 |
| **Rule BR-004** | **Health First Rule** | Runtime Verification 開始前に必ず `BrowserHealthCheck` を実行し、ヘルススコアが健全であることをアサートする。 |
| **Rule BR-005** | **Evidence Completeness Rule** | 収集される `RuntimeEvidenceModel` には、Screenshot, ConsoleLogs, NetworkLogs, DOMSnapshot, URL, Timestamp, ProfileName, SessionState を必須包含する。 |

---

## 4. 10 大必須拡張モデル (Core Governance Models)

### 1. BrowserRuntimeState (統一状態マシン)
`DISCONNECTED` → `CONNECTING` → `CONNECTED` → `HEALTHY` (`DEGRADED`, `SESSION_EXPIRED`, `PROFILE_INVALID`, `ERROR`)

### 2. BrowserCapability (機能 Capability Enum)
`CDP`, `SCREENSHOT`, `NETWORK`, `TRACE`, `VIDEO`, `HAR`, `PDF`, `DOWNLOAD`, `UPLOAD`

### 3. BrowserAdapter (脱 CDP 直接依存インターフェース)
`BrowserRuntime` → `BrowserAdapter` (Interface) → `ChromeCDPAdapter` (Impl) / `PlaywrightAdapter` (Future Impl)

### 4. RuntimeEvidenceModel (統一証跡モデル)
`screenshotRef`, `consoleLogs`, `networkLogs`, `domSnapshot`, `trace`, `timestamp`, `url`, `browserVersion`, `profileName`, `sessionState`

### 5. Browser Events (AIOS Event Bus 連動)
`BrowserConnected`, `BrowserDisconnected`, `PageOpened`, `NavigationCompleted`, `HealthChanged`, `EvidenceCollected`, `SessionExpired`

### 6. Browser Runtime Policy (ポリシーベース統制)
`CDP_REQUIRED`, `PROFILE_REQUIRED`, `HEALTH_REQUIRED`, `SESSION_REQUIRED`, `EVIDENCE_REQUIRED`

### 7. Browser Runtime Metrics (モニタリングメトリクス)
`connectionTimeMs`, `navigationTimeMs`, `memoryUsageMb`, `cpuPercent`, `evidenceSizeBytes`, `reconnectCount`, `healthScore`

### 8. Browser Session Model (独立セッションモデル)
`lineSession`, `googleSession`, `cookies`, `localStorage`, `indexedDb`, `sessionValid`, `expiration`, `lastVerifiedAt`

### 9. Browser Runtime Error (標準例外クラス階層)
- `CDPConnectionException`
- `ProfileViolationException`
- `SessionExpiredException`
- `HealthCheckFailedException`
- `EvidenceCollectionFailedException`

### 10. Browser Runtime Future (Gen 10 将来拡張ロードマップ)
- **Multi Browser**: Chromium, Firefox, WebKit, Electron 同時抽象サポート
- **Multi Profile**: 部署別・タスク別動的プロファイルプール
- **Remote Browser**: クラウド型分散ヘッドレスブラウザファーム連携
- **Distributed Browser Runtime**: 分散ノード間ブラウザセッション透過連携
- **Browser Pool**: ブラウザインスタンスのウォームプール高速割り当て
