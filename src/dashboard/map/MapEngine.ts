/**
 * MapEngine.ts
 * 
 * 地図描画・操作を抽象化するインターフェース、および
 * DOMベースの簡易ピン表示を行う初期地図エンジン（DOMMapEngine）の実装。
 */

import { AreaDetail } from '../DashboardStateModel';

export interface MapEngine {
  initialize(container: HTMLDivElement): void;
  destroy(): void;
  showAreas(areas: readonly AreaDetail[]): void;
  highlightArea(areaId: string): void;
  moveCamera(latitude: number, longitude: number): void;
  addMarker(marker: any): void;
  removeMarker(markerId: string): void;
  updateLayer(layerId: string, options: any): void;
}

export class DOMMapEngine implements MapEngine {
  private container: HTMLDivElement | null = null;
  private onAreaSelectedCallback: ((areaId: string) => void) | null = null;

  constructor(onAreaSelected?: (areaId: string) => void) {
    if (onAreaSelected) {
      this.onAreaSelectedCallback = onAreaSelected;
    }
  }

  initialize(container: HTMLDivElement): void {
    this.container = container;
  }

  destroy(): void {
    this.container = null;
    this.onAreaSelectedCallback = null;
  }

  showAreas(areas: readonly AreaDetail[]): void {
    if (!this.container) return;
    this.container.innerHTML = '';

    if (areas.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.innerText = '地区データが登録されていません。';
      emptyMsg.style.color = 'rgba(255, 255, 255, 0.3)';
      emptyMsg.style.fontSize = '14px';
      emptyMsg.style.margin = 'auto';
      this.container.appendChild(emptyMsg);
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

      this.container!.appendChild(pin);
    });
  }

  highlightArea(areaId: string): void {
    if (!this.container) return;
    const pins = this.container.querySelectorAll('.area-map-pin');
    pins.forEach(p => {
      const pin = p as HTMLDivElement;
      if (pin.innerText.includes(areaId)) {
        pin.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        pin.style.transform = 'scale(1.05)';
      } else {
        pin.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        pin.style.transform = 'scale(1)';
      }
    });
  }

  moveCamera(latitude: number, longitude: number): void {
    console.log(`[DOMMapEngine] moveCamera to lat=${latitude}, lng=${longitude}`);
  }

  addMarker(marker: any): void {
    console.log('[DOMMapEngine] addMarker', marker);
  }

  removeMarker(markerId: string): void {
    console.log(`[DOMMapEngine] removeMarker id=${markerId}`);
  }

  updateLayer(layerId: string, options: any): void {
    console.log(`[DOMMapEngine] updateLayer id=${layerId}`, options);
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
}
