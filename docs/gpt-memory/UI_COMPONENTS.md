# POSTING MAP UI Component Library (SSOT)

本ドキュメントは、POSTING MAP Dashboard を構成する各UIコンポーネントの構造、CSS仕様、およびインタラクション仕様を定義する唯一のカタログ基準（SSOT）である。

すべてのプロトタイプ作成およびコンポーネント開発は、本ドキュメントに定義された構造およびスタイルガイドラインを厳格に順守して実装し、コンポーネントの再利用性と保守性を最大化しなければならない。

---

## 1. コンポーネント一覧とブループリント (Component Blueprints)

### 1.1 Left Navigation Sidebar (固定サイドナビ)
左側に常駐する、ダッシュボード全体のナビゲーションおよびブランドタイトルを表示する固定サイドバー。
* **レイアウト要件**: `h-screen` 固定、スクロール不可。
* **HTML構造例**:
```html
<aside class="w-64 h-screen bg-[#161B22] border-r border-[rgba(255,255,255,0.08)] flex flex-col p-6 select-none">
  <!-- Brand Area -->
  <div class="mb-10">
    <h1 class="text-xs font-black text-[#EA5F08] tracking-widest uppercase">POSTING MAP</h1>
    <h2 class="text-lg font-black text-white leading-none mt-1">三重第3支部</h2>
    <p class="text-[9px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mt-1">Dashboard</p>
  </div>
  
  <!-- Navigation Links -->
  <nav class="flex-1 space-y-2">
    <a href="#" class="nav-item active flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-[rgba(255,255,255,0.04)] transition-all">
      <span class="text-base">📊</span> <span>ダッシュボード</span>
    </a>
    <a href="#" class="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.02)] transition-all">
      <span class="text-base">📦</span> <span>保管者</span>
    </a>
    <a href="#" class="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.02)] transition-all">
      <span class="text-base">🗺️</span> <span>エリア</span>
    </a>
    <a href="#" class="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.02)] transition-all">
      <span class="text-base">📝</span> <span>活動ログ</span>
    </a>
    <a href="#" class="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.02)] transition-all">
      <span class="text-base">📈</span> <span>活動分析</span>
    </a>
    <a href="#" class="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.02)] transition-all">
      <span class="text-base">🗳️</span> <span>投票率</span>
    </a>
    <a href="#" class="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.02)] transition-all">
      <span class="text-base">⚙️</span> <span>設定</span>
    </a>
  </nav>
</aside>
```

---

### 1.2 Header (情報ヘッダー)
画面上部に配置される、同期状況や更新時刻等を表示するコントロールヘッダー。
* **HTML構造例**:
```html
<header class="flex justify-between items-center py-4 border-b border-[rgba(255,255,255,0.08)] mb-6 select-none">
  <div class="flex items-center gap-3">
    <span class="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
    <span class="text-xs font-bold text-white tracking-wider">最新データを更新しました</span>
    <span class="text-xs text-[rgba(255,255,255,0.4)] font-mono">今日 10:42</span>
  </div>
  <div class="flex items-center gap-4">
    <button class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[rgba(255,255,255,0.04)] text-white/70 hover:text-white transition-all">🔄</button>
    <button class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[rgba(255,255,255,0.04)] text-white/70 hover:text-white transition-all">🌙</button>
    <button class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[rgba(255,255,255,0.04)] text-white/70 hover:text-white transition-all">❓</button>
  </div>
</header>
```

---

### 1.3 KPI Card (実績数値カード)
「活動人数」「新規活動人数」「保有枚数」を巨大な数値で示すためのカード。
* **特記事項**: 下部に状況の微小トレンドを示すミニスパークライングラフ領域を持つ。
* **HTML構造例**:
```html
<div class="premium-glass p-6 flex flex-col justify-between min-h-[9.5rem] relative select-none">
  <div class="flex justify-between items-start">
    <div class="flex items-center gap-2">
      <span class="text-lg">👥</span>
      <span class="text-xs font-bold text-[rgba(255,255,255,0.65)] uppercase tracking-wider">活動人数</span>
    </div>
    <span class="text-[10px] font-bold text-green-500 font-mono flex items-center gap-0.5">前日比 +4人 ▲</span>
  </div>
  <div class="my-3">
    <span class="text-4xl font-extrabold tracking-tighter text-white font-mono">30</span>
    <span class="text-sm font-bold text-[rgba(255,255,255,0.65)] ml-1">人</span>
  </div>
  <!-- Sparkline Graph Space -->
  <div class="w-full h-8 opacity-40 mt-1">
    <!-- SVG sparkline prototype dynamically injected here -->
    <svg class="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
      <path d="M 0 18 Q 20 8, 40 12 T 80 5 T 100 15" fill="none" stroke="#EA5F08" stroke-width="1.5"></path>
    </svg>
  </div>
</div>
```

---

### 1.4 Dashboard Card / Content Card (プレミアムガラスコンテナ)
中身のグラフや時系列ログを内包する基本のグリッド要素カード。
* **CSSスタイル規約**: DESIGN_SYSTEM.md の `.premium-glass` クラスと同一のレイヤースタイルを持つ。
* **HTML構造例**:
```html
<section class="premium-glass p-6 flex flex-col gap-4">
  <div class="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3 select-none">
    <div>
      <h3 class="text-base font-bold text-white tracking-tight">活動推移</h3>
      <p class="text-[10px] font-bold text-[rgba(255,255,255,0.4)] tracking-wide uppercase mt-0.5">Activity Trend (Line Chart)</p>
    </div>
    <div class="flex items-center gap-2">
      <select class="bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-1 text-xs text-white outline-none">
        <option>2025年4月</option>
      </select>
    </div>
  </div>
  <!-- Content Area (e.g. Graph Container) -->
  <div class="flex-1 min-h-[12rem] relative">
    <!-- Graph rendering logic -->
  </div>
</section>
```

---

### 1.5 Glass Tooltip (Apple風グラスツールチップ)
Hoverされた座標やデータポイントの上にオーバーレイ表示する詳細吹き出し。
* **HTML構造例**:
```html
<div class="glass-tooltip visible" style="top: 120px; left: 240px;">
  <!-- Tooltip title -->
  <div class="text-[11px] font-bold text-white mb-2 pb-1 border-b border-[rgba(255,255,255,0.08)] flex justify-between gap-4">
    <span>4/14 (月)</span>
    <span class="font-mono">144,900 枚</span>
  </div>
  <!-- Detail Data Items -->
  <div class="space-y-1 text-[10px] select-none">
    <div class="flex justify-between gap-6 text-[rgba(255,255,255,0.65)]">
      <span>👥 活動人数</span>
      <span class="font-bold text-white font-mono">30 人</span>
    </div>
    <div class="flex justify-between gap-6 text-[rgba(255,255,255,0.65)]">
      <span>🌱 新規活動人数</span>
      <span class="font-bold text-white font-mono">8 人</span>
    </div>
    <div class="flex justify-between gap-6 text-[rgba(255,255,255,0.65)]">
      <span>📦 配布枚数</span>
      <span class="font-bold text-white font-mono">1,250 枚</span>
    </div>
    <div class="flex justify-between gap-6 text-[rgba(255,255,255,0.65)]">
      <span>🏢 保管者数</span>
      <span class="font-bold text-white font-mono">18 人</span>
    </div>
  </div>
</div>
```

---

### 1.6 Timeline / Live Activity Log (時系列活動ログ)
現場から上がってきた活動報告をリアルタイムに流し込むログタイムラインのログカード。
* **特記要件**: 新規追加時は3秒間オレンジにGlow（発光）させる。
* **HTML構造例**:
```html
<div class="flex items-center justify-between p-4 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-2xl select-none transition-all duration-300">
  <div class="flex items-center gap-3">
    <span class="text-xs font-mono text-[rgba(255,255,255,0.4)]">10:42</span>
    <span class="w-2 h-2 bg-[#EA5F08] rounded-full shadow-[0_0_8px_#EA5F08]"></span>
    <span class="text-xs font-bold text-white font-mono">S008</span>
    <span class="text-xs text-[rgba(255,255,255,0.65)]">500枚配布</span>
  </div>
  <span class="text-[10px] font-bold text-[#EA5F08] bg-[rgba(234,95,8,0.1)] px-2.5 py-0.5 rounded-full">鈴鹿市</span>
</div>
```

---

### 1.7 Progress Bar (市別・全体進捗バー)
市町村名や投票率の対比等を表示する際に使用されるプログレスバーコンポーネント。
* **HTML構造例**:
```html
<div class="space-y-1.5 select-none">
  <div class="flex justify-between items-center text-xs font-bold">
    <span class="text-white">鈴鹿市</span>
    <div class="flex items-center gap-3">
      <span class="text-[rgba(255,255,255,0.65)]">67.43 %</span>
      <span class="text-[9px] text-green-500 font-mono font-bold">+11.17 ▲</span>
    </div>
  </div>
  <div class="w-full h-1.5 bg-[#0B0F14] rounded-full overflow-hidden">
    <div class="h-full bg-[#EA5F08] rounded-full transition-all duration-1000 shadow-[0_0_8px_#EA5F08]" style="width: 67.43%"></div>
  </div>
</div>
```

---

## 2. スタイル統合ガイド (Integration Rules)
ダッシュボードプロトタイプを組み立てる際は、これらのコンポーネント設計（クラス・変数・構成）を組み合わせて実装してください。

コンポーネントごとのデザイン仕様や寸法は、この `UI_COMPONENTS.md` に集約され、追加・更新があった場合は、このドキュメントを更新してから開発へ反映するものとします。
