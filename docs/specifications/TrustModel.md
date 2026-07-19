# Trust Model 仕様書

## 概要
本仕様書は、信頼度スコアリング、その判断根拠となる実績証跡（Trust Evidence）、および時間の経過に伴う信頼度の動的変化（Trust Decay）を表すモデルを規定します。

## 信頼実績証跡モデル (TrustEvidence)
- `evidenceId`: 証跡の一意識別ID
- `identityId`: 対象アイデンティティID
- `source`: 証跡収集元（例: `SignatureVerification`, `ComplianceEngine`, `SecurityRuntime` など）
- `category`: 証跡カテゴリ（例: `cryptographic_signature`, `compliance_eval`）
- `score`: この証跡単体に対する適合・成功度合いスコア (0〜100)
- `weight`: この証跡の評価における重み (0.0〜1.0)
- `timestamp`: 証跡発生/収集タイムスタンプ

## 信頼減衰モデル (Trust Decay)
長期にわたり認証や検証が行われない主体は、潜在的な鍵侵害や動作不適合のリスクが高まります。そのため、時間の経過とともに信頼度を自動的に減衰させます。
- **減衰の計算式**:
  最後に対象主体の署名検証または動作監査が行われた時刻 `lastVerifiedAt` からの経過時間（時間単位）に基づき、以下の減衰が適用されます。
  $$\text{Decay} = \text{ElapsedHours} \times \text{decayRatePerHour}$$
  $$\text{CurrentScore} = \max(0, \text{CalculatedScore} - \text{Decay})$$
- ** decayRatePerHour**: 1時間ごとに低下するスコア値（Governance Runtime の `TrustPolicy` から動的ロードされます）。
