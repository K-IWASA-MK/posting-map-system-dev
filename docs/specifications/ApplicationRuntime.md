# Application Runtime 仕様書

## 概要
本仕様書は、ワークフロー定義や利用サービスを束ね、環境プロファイルに準拠して一元的に配備・実体化する「Application Runtime」の仕様を定義します。

## 構成と責務
1. **アプリプロビジョニング (Provisioning Plan)**:
   - アプリケーション登録時にマニフェスト要件を検証し、配備計画 `ProvisioningPlan` を起票します。
2. **依存性・署名完全性の検証**:
   - `ApplicationSignature` に基づき改ざん検知（署名ハッシュ照合）を行い、必要なサービス・リソースが Service Registry に満たされているかを自動検証します。
3. **ライフサイクル管理**:
   - アプリケーションの状態遷移（INACTIVE ➔ ACTIVE / Activated）を統治し、配備検証（ProvisioningValidated）から実際の実行アクティブ化までを順序制御します。
