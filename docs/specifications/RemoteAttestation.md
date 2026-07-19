# Remote Attestation (リモートアテステーション仕様書)

## 概要
実行委譲先のノードが改ざんされておらず、安全かつ信頼できる実行整合性（Runtime Integrity & Container Integrity）を保持しているかをリモート検証するモデルです。

## アテステーション状態遷移 (AttestationState)
リモートノードの整合性確認は、常に以下の明確な状態遷移を持ちます。

- **REQUESTED**: アテステーション検証要求中。
- **VERIFIED**: 整合性検証に成功し、信頼性が担保された状態。
- **REJECTED**: ハッシュ不一致や検証失敗による信頼性なし（起動拒否）。
- **EXPIRED**: 検証有効期限切れ。
