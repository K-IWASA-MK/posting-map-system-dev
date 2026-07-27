---
knowledgeId: PM-KNOWLEDGE-001
projectId: posting-map
category: CONFIG_GOTCHA
status: ACTIVE_PROJECT_KNOWLEDGE
createdFrom:
  - TASK-POSTING-MAP-001
  - TASK-POSTING-MAP-002
  - TASK-POSTING-MAP-003
  - TASK-POSTING-MAP-004
confidence: 0.92
validation:
  evidenceCount: 3
  cycleCompleted: true
createdAt: 2026-07-27
---

# POSTING MAP GAS Endpoint SSOT Management Rule

## Pattern
POSTING MAP において、複数支部設定 (`clients/*/config.js`, `active/dashboard/clients/*/config.js`) と `app/index.html` の fallback URL が分散直書きされていると、開発・更新時の URL 分岐により LIFF → GAS API 通信障害（HTTP Status / JSON parse error / 認証不全）の主要因となる。

## Detection Rule
通信障害や LIFF 連携異常の調査時は以下を最優先で確認する:
1. `deployment.json` (`resources.webAppUrl`) の SSOT URL
2. `clients/*/config.js` (`api.gasWebAppUrl`)
3. `app/index.html` の fallback `API_URL`
4. `active/dashboard/clients/*/config.js` (`api.gasWebAppUrl`)

## Prevention Rule
- GAS WebApp URL は `deployment.json` を唯一の管理元 (Single Source of Truth) とする。
- URL 変更・デプロイ前には必ず SSOT バリデータスクリプト `scripts/validate-gas-endpoint-ssot.mjs` を実行し、不一致がないことを検証する。

## Applicable Scope
- **Project**: `posting-map`
- **Capabilities**: `LIFF`, `LINE_INTEGRATION`, `GOOGLE_APPS_SCRIPT`, `FRONTEND`
