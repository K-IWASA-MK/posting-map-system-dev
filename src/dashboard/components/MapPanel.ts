/**
 * MapPanel.ts
 * 
 * ダッシュボードの地図可視化領域を担当するコンポーネント。
 * エリア進捗（マーカーリスト）のプロットおよびクリックイベントを仲介する。
 */

import { AreaDetail } from '../DashboardStateModel';

export class MapPanel {
  private readonly element: HTMLDivElement;
  private readonly markerContainer: HTMLDivElement;
  private onAreaSelectedCallback: ((areaId: string) => void) | null = null;

  constructor() {
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
    this.markerContainer.innerHTML = '';
    
    if (areas.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.innerText = '地区データが登録されていません。';
      emptyMsg.style.color = 'rgba(255, 255, 255, 0.3)';
      emptyMsg.style.fontSize = '14px';
      emptyMsg.style.margin = 'auto';
      this.markerContainer.appendChild(emptyMsg);
      return;
    }

    areas.forEach(area => {
      const pin = document.createElement('div');
      pin.className = 'area-map-pin';
      this.applyPinStyles(pin, area.progressRate);

      const label = document.createElement('span');
      label.innerText = `${area.areaName} (${area.progressRate}%)`;
      
      pin.appendChild(label);
      
      // Click = Animation Rule
      pin.addEventListener('click', () => {
        pin.style.transform = 'scale(0.95)';
        setTimeout(() => {
          pin.style.transform = 'scale(1)';
          if (this.onAreaSelectedCallback) {
            this.onAreaSelectedCallback(area.areaId);
          }
        }, 100);
      });

      this.markerContainer.appendChild(pin);
    });
  }

  private applyPinStyles(el: HTMLDivElement, progress: number) {
    const s = el.style;
    s.padding = '8px 16px';
    s.borderRadius = '16px';
    s.fontSize = '12px';
    s.fontWeight = '700';
    s.cursor = 'pointer';
    s.display = 'inline-flex';
    s.alignItems = 'center';
    s.border = '1px solid rgba(255, 255, 255, 0.08)';
    s.transition = 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)';
    s.height = 'fit-content';

    // 進捗率に応じたプレミアム発光カラーマッピング
    if (progress >= 100) {
      s.color = '#10b981';
      s.background = 'rgba(16, 185, 129, 0.1)';
      s.boxShadow = 'inset 0 0 10px rgba(16, 185, 129, 0.1)';
    } else if (progress > 0) {
      s.color = '#3b82f6';
      s.background = 'rgba(59, 130, 246, 0.1)';
      s.boxShadow = 'inset 0 0 10px rgba(59, 130, 246, 0.1)';
    } else {
      s.color = 'rgba(255, 255, 255, 0.4)';
      s.background = 'rgba(255, 255, 255, 0.03)';
    }

    el.addEventListener('mouseenter', () => {
      s.transform = 'translateY(-2px)';
      s.borderColor = 'rgba(255, 255, 255, 0.2)';
    });

    el.addEventListener('mouseleave', () => {
      s.transform = 'translateY(0)';
      s.borderColor = 'rgba(255, 255, 255, 0.08)';
    });
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}
