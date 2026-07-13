# Dashboard Map Intelligence Specification (SaaS Product Version 1.0)

## 1. 目的 (Purpose)
Premium Dashboard UI に対し、地域活動（進捗）と選挙結果データ（投票率）を地理空間マップ上で直感的・多角的に理解・重ね合わせるための Map Intelligence Layer の設計を定義する。

---

## 2. 可視化限定ポリシー (Visualization Only Policy)

- **AI 自動判断・ルート推薦の排除 (No Auto-Route / Priority Selection)**:
  - マップ上の色表現、グラフ、およびオーバーレイは、すべて「利用者の主体的な状況判断と意思決定をサポートするための客観的な可視化」に限定される。
  - システムまたは AIOS が、「配布優先地区」を自律決定したり、配布スタッフに対して強制的なルート推薦や優先指示を行うロジックは一切組み込んではならない。
- **総合スコア生成の禁止 (No Mixed Scoring)**:
  - 投票率データと現在の配布進捗を合成した単一の「優先スコア」「総合指標」などの生成を禁止する。これらは完全に独立したレイヤーとして描画し、判断は利用者に委ねる。

---

## 3. レイヤー構成と色表現 (Geographic Overlay Layers)

可視化の独立性を守るため、以下の2つのビジュアルレイヤーを完全に分離して管理・表示する。

### 3.1. ActivityProgressLayer (活動進捗レイヤー)
- **対象**: 現在進行中のスプリントの配布枚数進捗率（`doneCount / totalHouseholds`）。
- **色表現**:
  - `0%`（未配布）: 透明（黒背景に馴染む）
  - `1% - 99%`（配布中）: 半透明ブルー (`rgba(59, 130, 246, 0.4)`)
  - `100%`（完了）: 半透明エメラルドグリーン (`rgba(16, 185, 129, 0.5)`)

### 3.2. VoteTurnoutLayer (過去選挙投票率履歴レイヤー)
- **対象**: `VoteTurnoutMaster` から取得した過去の国政選挙の投票率。
- **色表現**:
  - `70%以上` (高投票率) : 鮮明な紫（微発光 `rgba(168, 85, 247, 0.6)`）
  - `50% - 69%` (中投票率) : 薄紫 (`rgba(168, 85, 247, 0.3)`)
  - `50%未満` (低投票率) : 暗灰色 (`rgba(255, 255, 255, 0.1)`)

---

## 4. 地図選択とイベントフロー (Area Selection Flow)

地区（Areaピンまたはポリゴン）がクリックされた際のインタラクションは、以下の決定論的コントローラーフローによって処理される。

```
[ Map Panel Node Clicked ]
           │
           ▼
[ AreaSelectionController ] ──> AreaID 抽出
           │
           ▼
[ DashboardStateModel ] ──> loadVoteTurnout(areaId) & loadEventLogs(areaId) 起動
           │
           ▼
[ DashboardLayout / Panel ] ──> AreaDetailPanel.updateDetails() 実行
           │
           ▼
[ AreaDetailPanel Slide-in ] ──> VoteTurnoutVisualizer & Activity Logs を 300ms で展開
```

---

## 5. 投票率推移の可視化仕様 (VoteTurnout Visualizer Rules)

利用者が直近3回の選挙結果と傾向を一目で理解できるよう、シンプルで直感的なゲージ/進捗バー（CSSアニメーション）を適用する。

- **表示項目**:
  - 選挙名 / 年（例: `2024 衆院選`）
  - 投票率バー（％に比例した横幅のプログレスバー）
  - 全国平均との対比ライン（全国平均位置に薄い垂直の点線をオーバーレイ）
- **表示形態**:
  - 最新の選挙、前回の選挙、前々回の選挙の順で時系列に並べて垂直配置し、履歴の増減傾向が視覚的に掴める形式とする。
