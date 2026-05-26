Created At: 2026-05-26T12:03:00Z
File Path: `file:///Volumes/SSD_DATA/posting-map-system/HANDOVER_TO_FLASH.md`

# 開発引き継ぎ事項 (更新: 2026-05-26 v270 — Claude Sonnet 引き継ぎ用)

次回の担当AIへ。以下のコンテキストを読み込み、**前回タスクの変更点のみ**を確認して作業を再開してください。

> [!IMPORTANT]
> **再開時の検証ルール (AGENTS.mdより)**:
> セッション再開時は、前回実施された変更点の確認作業のみを行ってください。システム全体に及ぶ網羅的な確認や再テストは不要です。

---

## 1. プロジェクト概要

- **フロントエンド**: GitHub Pages (`area-management.github.io/posting-map-system`)
- **バックエンド**: Google Apps Script (GAS) API
- **GAS デプロイID**: `AKfycbyFoJ2Tp7F4MOZ3lNyVDLTl45fVlV-hyAC1uYGL42oXkjBJ3ylST3KUYpaTb0lpK9FmSA`
- **現在のキャッシュバスター**: `v270`
- **Gitブランチ**: `main`、最新コミット `09342b4`（ローカルコミット済み、`git push`はユーザー（岩佐さん）が行う）

---

## 2. 今回 (v270) 完了したタスクと変更点

### ① ボトムナビの3種類化 (`index.html`, `app.js`)
- `📍 地区` → `🗺️ エリア`、`🏆 ランキング` (NEW)、`👤 ID` の3ボタン構成に刷新。
- `app.js` のアクティブ状態制御 (`opacity 1/0.3`) を3ボタン対応に拡張。
- `page-ranking` セクションを `index.html` に追加。

### ② 市・自治体ごとのドリルダウン（2層構造）(`render.js`)
- **第1層（市一覧）**: 「エリア」ボタンをタップすると、四日市市・鈴鹿市・亀山市などの自治体単位のカードが表示される。
- **第2層（エリアシート一覧）**: 市カードをタップすると、その市に属するエリアシート（「鈴鹿市」「鈴鹿市(2)」等）が表示される。
- `getCityName(areaName)` で自動的に市名を判定（ハードコードなし、正規表現で動的判別）。
- `selectCity(cityName)` / `backToCityList()` でナビゲーション制御。
- `currentCity = null` を `app.js` のグローバル変数として宣言済み。

### ③ ランキング画面UI完成 (`render.js`)
- `renderRanking()` 関数を完全実装。
  - **My Performance カード**: 自分の名前と現在の順位を画面上部に表示。
  - **ランキングリスト**: 1位（金）・2位（銀）・3位（銅）に対応した美麗なグロー付きカードと、自分の行には青い「YOU」バッジを表示。
  - 現在は`defaultRanking`（モックデータ）で表示。実APIデータ（`rankingData`グローバル変数）が入れば自動的に切り替わる設計。

### ④ IDカードにジャイロ連動外枠エフェクトの準備 (`style.css`, `render.js`)
- `style.css` に `.gyro-card` クラスを追加（CSSカスタム変数 `--glow-x`, `--glow-y`, `--edge-angle` でジャイロ反応を受ける設計）。
- IDカードのDIVに `id="id-gyro-card"` と `class="gyro-card"` を付与済み。
- **⚠️ 未完了**: `app.js` にジャイロセンサー（`DeviceOrientationEvent`）のリスナーとカスタム変数更新ロジックをまだ追加していない。これを次のタスクで実装する必要がある。

---

## 3. 次の担当者への残タスク

### 🔥 最優先タスク: ジャイロセンサー連動の実装 (`app.js`)

`app.js` に以下のジャイロセンサーリスナーを追加してください。

```javascript
// ジャイロセンサー連動 IDカード外枠エフェクト
function setupGyroEffect() {
  const card = document.getElementById('id-gyro-card');
  if (!card) return;

  // 自動揺らぎ（ジャイロなし環境用フォールバック）
  let autoAngle = 0;
  const autoInterval = setInterval(() => {
    if (!card || !document.getElementById('id-gyro-card')) {
      clearInterval(autoInterval);
      return;
    }
    autoAngle += 0.5;
    const x = Math.sin(autoAngle * Math.PI / 180) * 8;
    const y = Math.cos(autoAngle * Math.PI / 180) * 4;
    card.style.setProperty('--glow-x', `${x}px`);
    card.style.setProperty('--glow-y', `${y}px`);
    card.style.setProperty('--edge-angle', `${(autoAngle % 360) + 90}deg`);
    card.style.setProperty('--glow-opacity', '0.1');
    card.style.setProperty('--edge-opacity', '0.1');
  }, 30);

  // iOS ジャイロセンサー連動（許可がある場合に上書き）
  const handleOrientation = (event) => {
    const gyroCard = document.getElementById('id-gyro-card');
    if (!gyroCard) return;
    const gamma = Math.max(-30, Math.min(30, event.gamma || 0)); // 左右傾き -30~30
    const beta  = Math.max(-20, Math.min(20, (event.beta || 0) - 45)); // 前後傾き
    const glowX = (gamma / 30) * 16;
    const glowY = (beta  / 20) * 10;
    const edgeAngle = 180 + (gamma / 30) * 60;
    const glowOpacity = 0.06 + Math.abs(gamma / 30) * 0.18;
    const edgeOpacity = 0.08 + Math.abs(gamma / 30) * 0.22;

    gyroCard.style.setProperty('--glow-x', `${glowX}px`);
    gyroCard.style.setProperty('--glow-y', `${glowY}px`);
    gyroCard.style.setProperty('--edge-angle', `${edgeAngle}deg`);
    gyroCard.style.setProperty('--glow-opacity', glowOpacity.toFixed(3));
    gyroCard.style.setProperty('--edge-opacity', edgeOpacity.toFixed(3));
  };

  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ は明示的許可が必要
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          clearInterval(autoInterval);
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }).catch(() => {});
  } else if (typeof DeviceOrientationEvent !== 'undefined') {
    // Android等は許可不要
    clearInterval(autoInterval);
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}
```

この `setupGyroEffect()` は `renderSettings()` の末尾（`userInfo` が存在する場合）に `setTimeout(() => setupGyroEffect(), 100)` で呼び出してください。

---

## 4. デザイン保護・固定ルール（変更禁止事項）

- **上部ヘッダー**: `px-6` の横幅および `gap-3` レイアウトが確定版（変更禁止）。
- **ONLINEインジケーター**: `animate-soft-pulse` による1.5秒の微パルスが確定版（変更禁止）。
- **下部ナビゲーション**: 3ボタン構成（🗺️ エリア、🏆 ランキング、👤 ID）が確定版（変更禁止）。
- **IDカード外側ラッパー**: `pt-2 pb-0 px-4 flex flex-col items-center` が確定版（変更禁止）。
- **タイトル〜IDカード間の余白**: `mb-6` (24px) が確定版（変更禁止）。
- **設定画面スクロール固定**: スクロール不可の固定レイアウト（変更禁止）。
- **キャッシュバスター**: 現在 `v270`。フロントエンドを変更する際は必ず `v271` に更新してください。
