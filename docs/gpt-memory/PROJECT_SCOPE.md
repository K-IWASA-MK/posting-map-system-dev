# Project Scope & Default Environment (SSOT)

## 📍 1. Current Default Tenant
- **Tenant ID**: `MIE-03`
- **Branch ID**: `MIE-03`
- **Branch Name**: `三重第3支部` (Display Name)
- **District**: `三重県 第3区`

## 📍 2. Tenant Abstraction Rules
- Always avoid hardcoding specific Tenant IDs (like `MIE-03` or `AICHI-05`) directly in application logic.
- Use the configuration layers (`CONFIG` object in frontend `config.js` and backend `v2_config.gs`) to lookup settings dynamically.
- The standard testing environment is default-mapped to `MIE-03`, but the system must be fully compatible with any generic tenant IDs (e.g. `AICHI-05`, `GIFU-02`, `SHIZUOKA-01`).

## 📍 3. Dashboard Development Sequence (Roadmap)

### Phase 1: Mock Data ➔ Dashboard UI/UX Completion (Current Phase)
* **目的**: 実際のGAS API接続を行わず、モックデータのみを用いてDashboardのUI・UX・アニメーション・操作性の完成度を極限まで引き上げる。
* **要件**: モックデータは、将来の実データ接続時に容易にJSON差し替えが行えるよう、**データ構造とUI描画ロジックを完全に分離（疎結合）**して設計する。

### Phase 2: GAS Connection ➔ JSON Retrieval
* **目的**: バックエンド（GAS）と通信させ、ダッシュボード用の集計JSONを取得可能にする。

### Phase 3: Real Data Replacement
* **目的**: Phase 1で完成させたUIコンポーネントに、Phase 2で取得した実データを結合・描画する。

### Phase 4: Tuning & Optimization
* **目的**: パフォーマンスの調整、通信遅延時の表示制御（段階的描画・Opacity制御）などをチューニングする。

---

> [!IMPORTANT]
> **AI（Flash）への重要命令**:  
> Phase 1のフェーズにおいては、実データ（GAS）への接続コードは一切実装しないこと。すべてモックデータを用いて開発し、デザインシステム（DESIGN_SYSTEM.md）に定義された「滑らかなアニメーション」や「Glass Tooltip」などのUX体験の完成に全力を注ぐこと。

