# Tenant Context Specification

AIOS Dashboard およびデータ境界モデルにおける Tenant Context （テナント隔離情報）の客観的定義書。
本仕様は、将来の複数組織・複数支部展開（マルチテナント）のデータ隔離境界を安全に表現することを目的とし、アクセスセキュリティ管理や課金判断のロジックは一切含めない。

---

## 1. Tenant Context Object Schema

アプリケーション全体で利用されるテナント隔離情報の客観的データ構造。Object 生成時に `Object.freeze()` の適用を必須とする。

```typescript
interface TenantContextObject {
  tenantId: string;       // テナントを識別する一意の識別コード (e.g., "MIE-03", "TOKYO-01")
  tenantName: string;     // 表示用支部名・組織名 (e.g., "三重第3支部", "東京第1支部")
  environment: "SIMULATION" | "PRODUCTION"; // 動作環境の区分
  createdAt: string;      // コンテキスト生成時刻のISO 8601表記
}
```

---

## 2. 絶対除外原則 (Forbidden Security Elements)
テナント・コンテキストは「隔離境界の表現」のみに特化し、以下の情報を含めたり参照させたりしてはならない。

* **認証・認可に関する情報**:
  `userId`、`password`、`token`、`apiSecret` などの情報。
* **権限・ロールに関する情報**:
  `role`、`permissions` などの認可情報。
* **契約・課金に関する情報**:
  `billingStatus`、`subscriptionPlan` などの Stripe 連動情報。

---

## 3. 初期アロケーション定義 (Default Allocation)
本システムのデフォルトテスト環境として、以下の Tenant Context 値を Singleton 固定初期値とする。

```json
{
  "tenantId": "MIE-03",
  "tenantName": "三重第3支部",
  "environment": "SIMULATION"
}
```
動作時には、アダプターおよびレンダラーはこの Singleton 構造体を参照し、PC/モバイルのヘッダーおよびデータ境界として適用する。
