# ダッシュボードUX仕様書 (Dashboard UX Specification)

## UX デザイン (UX Design)
AIOS Dashboard は、極上の高級感と実運用上の信頼性を両立させるため、Apple ネイティブアプリと同等の「余白」および「ガラスモーフィズム」を重視したインターフェース設計を行う。

---

## 視覚的階層 (Visual Hierarchy)
表示要素は、管理者が一瞥しただけで稼働健全度を識別できるよう、明瞭な重要度で階層化される。
1. **最高位階層 (Header)**: 全体システムステータス（HEALTHY等）と実行環境（LOCAL SIMULATION）。
2. **中間階層 (Kernel Status Card)**: 各カーネルの Active/Idle 稼働状態インジケーター。
3. **詳細階層 (Metrics Cards)**: 各種 Quality, Knowledge, Governance, Billing, Simulation の詳細数値メトリクス。

---

## 視線誘導 (Reading Flow)
- **左上から右下へのフロー**:
  - 管理者の視線は「ヘッダーロゴ ──> システムステータス ──> 左サイドバー ──> メイングリッド」の順で自然に流れるようにし、情報の重複や乱雑さを排除する。
- **アクセシビリティ (Accessibility)**:
  - 漆黒（#000000）の背景に対して、主要テキストには高コントラストの純白（#ffffff）、補足テキストには 0.72 不透明度の白を使用し、いかなるディスプレイ輝度環境でも優れた視認性を保証する。
