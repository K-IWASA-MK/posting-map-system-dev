# 活動ログカード仕様書 (Activity Log Card Specification)

## 概要 (Overview)
本仕様書は、AIOS 各モジュールおよびシミュレーション監査履歴を時系列リストで表示する「活動ログカード（`ActivityLogCard.js`）」の表示要件および演出仕様を規定する。

---

## ログ構造定義 (HTML Structure)
ログ項目は以下の時系列リスト形式で出力され、各項目は Stagger 演出で順番にフェードインする。

```html
<section class="card premium-glass grid-col-2" data-motion="fade-up" data-delay="[DELAY]">
  <h2>System Activity Log</h2>
  <div class="log-container">
    <ul class="log-list">
      <!-- 各ログアイテム (Glow 演出対象) -->
      <li class="log-item [GLOW_CLASS]" data-motion="log-fade" data-delay="[ITEM_DELAY]">
        <span class="log-time">[HH:MM:SS]</span>
        <span class="log-module">[MODULE_NAME]</span>
        <span class="log-message">[MESSAGE_CONTENT]</span>
      </li>
    </ul>
  </div>
</section>
```

---

## 表示・演出仕様 (Visual & Animation Details)
- **新着 Glow 演出**:
  - 最も新しいログアイテム（リストの先頭など）に対しては、強調表示として約 3 秒間、オレンジ色（`rgba(234, 88, 12, 0.15)`）の微発光背景（Glow）をアタッチし、その後ゆっくりと周囲の純黒／ダークグレーに馴染むようにフェードアウト減衰させる。
- **Stagger フェードイン (Staggered Fade-in)**:
  - ログの各要素は、初期ロード時に 50ms ずつ描画遅延をズラしながら順次出現するフェードイン効果（`data-motion="log-fade"`）を適用する。
