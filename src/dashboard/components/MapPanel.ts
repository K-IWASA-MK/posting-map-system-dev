/**
 * MapPanel.ts
 * 
 * ダッシュボードの地図可視化領域を担当するコンポーネント。
 * エリア進捗（マーカーリスト）のプロットおよびクリックイベントを仲介する。
 */

import { AreaDetail } from '../DashboardStateModel';
import { MapEngine, DOMMapEngine } from '../map/MapEngine';

export class MapPanel {
  private readonly element: HTMLDivElement;
  private readonly markerContainer: HTMLDivElement;
  private readonly mapEngine: MapEngine;
  private onAreaSelectedCallback: ((areaId: string) => void) | null = null;

  constructor(mapEngine?: MapEngine) {
    this.element = document.createElement('div');
    this.element.className = 'map-visualization-panel';
    this.applyStyles();

    // Map Title overlay
    const title = document.createElement('div');
    title.innerText = 'MAP PREVIEW LAYER (GEOSPATIAL)';
    title.style.position = 'absolute';
    title.style.top = '16px';
    title.style.left = '16px';
    title.style.fontSize = '12px';
    title.style.fontWeight = '700';
    title.style.color = 'rgba(255, 255, 255, 0.4)';
    title.style.letterSpacing = '0.05em';
    title.style.zIndex = '10';

    this.markerContainer = document.createElement('div');
    this.markerContainer.style.position = 'absolute';
    this.markerContainer.style.width = '100%';
    this.markerContainer.style.height = '100%';
    this.markerContainer.style.top = '0';
    this.markerContainer.style.left = '0';
    this.markerContainer.style.display = 'flex';
    this.markerContainer.style.flexWrap = 'wrap';
    this.markerContainer.style.gap = '8px';
    this.markerContainer.style.padding = '40px 16px 16px 16px';
    this.markerContainer.style.boxSizing = 'border-box';
    this.markerContainer.style.overflowY = 'auto';

    this.element.appendChild(title);
    this.element.appendChild(this.markerContainer);

    // Initialize Map Engine
    this.mapEngine = mapEngine || new DOMMapEngine((areaId) => {
      if (this.onAreaSelectedCallback) {
        this.onAreaSelectedCallback(areaId);
      }
    });
    this.mapEngine.initialize(this.markerContainer);
  }

  private applyStyles() {
    const s = this.element.style;
    s.position = 'relative';
    s.borderRadius = '28px';
    s.background = 'rgba(10, 10, 12, 0.6)';
    s.border = '1px solid rgba(255, 255, 255, 0.05)';
    s.width = '100%';
    s.height = '480px';
    s.overflow = 'hidden';
    s.boxSizing = 'border-box';
  }

  onAreaSelected(callback: (areaId: string) => void) {
    this.onAreaSelectedCallback = callback;
  }

  /**
   * エリアマスタの実データをマッピング表示する (Real Data Binding)
   */
  updateAreas(areas: readonly AreaDetail[]) {
    this.mapEngine.showAreas(areas);
  }

  /**
   * 特定のエリアを選択ハイライト表示する
   */
  highlightArea(areaId: string) {
    this.mapEngine.highlightArea(areaId);
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}

