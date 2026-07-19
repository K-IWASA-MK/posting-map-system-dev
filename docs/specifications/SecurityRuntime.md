# Security Runtime 仕様書

## 概要
本仕様書は、AIOS における認証・認可・監査およびシークレット取得仲介（Secret Broker）を担う「Security Runtime」の仕様を定義します。

## 構成と責務
1. **セキュリティコンテキストの標準化 (Security Context)**:
   - すべてのセキュリティ判定の入力形式となる `SecurityContext`（contextId, runtimeId, principalId,sessionId, sandboxId, trustLevel, capabilities[]）を管理します。
2. **認可判断 (Authorization Engine)**:
   - クライアントのセキュリティコンテキスト、パーミッション、および capability token に基づいて ALLOW/DENY の認可判断（AuthorizationDecision）を下します。
3. **機密仲介 (Secret Access Broker)**:
   - シークレットへのアクセス要求を仲介し、直接の参照を完全に防いだ状態で、認可されたリクエストにのみシークレット値を渡します。
4. **監査記録 (Security Audit)**:
   - アクセス判断および侵害検知されたイベントを重要度別に `SecurityAuditRecord` に記録し、Event Ledger へコミットします。
