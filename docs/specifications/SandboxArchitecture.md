# Sandbox Architecture 仕様書

## 概要
本仕様書は、プラグインがシステムホストおよび他の Runtime から隔離されて実行されるサンドボックス実行空間（Sandboxed Plugin Environment）のアーキテクチャ境界を定義します。

## サンドボックス分離アーキテクチャ

```
[Plugin Runtime] (隔離コンテナ)
        │
        ▼ (Intercepted Node APIs / Sandbox Policy)
[Sandbox Manager] (リソース制限 & 通信制御)
        │
        ▼ (Audit Trail & Authorization)
[Security Runtime] (セキュリティ判断・シークレット仲介)
```

## 統合セキュリティイベントフロー
セキュリティランタイムおよびサンドボックスに関わるイベントは、以下の順序で一方向データフローとして EventBus を伝播します。

```
SecurityPolicyLoaded ➔ AuthorizationEvaluated ➔ SecretAccessEvaluated ➔ SandboxCreated ➔ PluginExecutionStarted ➔ SecurityViolationDetected ➔ SecurityAuditRecorded ➔ SandboxDestroyed
```

1. **SecurityPolicyLoaded**: セキュリティ構成やデフォルトプロファイルが初期ロードされた際に発行。
2. **AuthorizationEvaluated**: 各リソースへの認可可否判定（ALLOW/DENY）が下された際に発行。
3. **SecretAccessEvaluated**: シークレット仲介要求が監査・処理された際に発行。
4. **SandboxCreated**: 隔離環境 `SandboxInstance` が新しく生成された際に発行。
5. **PluginExecutionStarted**: サンドボックス内でプラグインの実行処理が開始された際に発行。
6. **SecurityViolationDetected**: リソース制限超過や不正なアクセス違反が発生した際に発行（是正アクションを即時キック）。
7. **SecurityAuditRecorded**: 不変監査レコードが Event Ledger に正常コミットされた際に発行。
8. **SandboxDestroyed**: プラグイン終了時または是正処理によりサンドボックスが破棄された際に発行。
