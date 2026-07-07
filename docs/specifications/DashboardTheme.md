# ダッシュボードテーマ仕様書 (Dashboard Theme Specification)

## 目的
AIOS Dashboard 内で適用されるデザインシステムトークン（カラー、タイポグラフィ、余白、エッジ、およびガラス効果）を一元定義し、UI 共通の重厚な世界観を維持する。

---

## ザ・確定デザインシステムトークン (Design Tokens)

### 1. カラー定義 (Color Tokens)
- **Layer 1 (背景)**: `#000000` (純黒)
- **Layer 2 (固定コンポーネント)**: `#1C1C1E` (ダークグレー)
- **アクセント青**: `#2563eb` (メトリクス主要値、装飾境界線)
- **アクセント緑**: `#22c55e` (オンライン、健康状態、適合値)
- **警告オレンジ**: `#ea580c` (フォールバック状態、キー欠損警告)
- **エラー赤**: `#ef4444` (通信遮断エラー、致命的検証失敗)

### 2. タイポグラフィ (Typography Tokens)
- **基本フォント**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **主要見出し (Card H2)**: Weight `600`, Size `1.1rem`, Color `#ffffff`
- **メトリクス値 (Value)**: Weight `700`, Size `1.5rem` 〜 `2.0rem`
- **補助ラベル (Label)**: Weight `500`, Size `0.8rem`, Color `rgba(255,255,255,0.6)`
- **タイムスタンプ・補足 (SubText)**: Size `0.85rem`, Color `rgba(255,255,255,0.72)`

### 3. 余白・グリッド・ガラス効果 (Spacing & Glass System)
- **Card Radius**: `28px`
- **Backdrop Blur**: `20px` (Webkit-Backdrop-Filter 同時指定)
- **Card Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Card Hover Glow**:
  - `box-shadow: 0 10px 40px rgba(37, 99, 235, 0.08)`
  - `border-color: rgba(37, 99, 235, 0.3)`
