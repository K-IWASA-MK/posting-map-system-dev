/**
 * DashboardHeader.ts
 * 
 * ダッシュボードヘッダーコンポーネント。
 * ブランド表示、ナビゲーション、およびAPI同期ステータス表示を担当。
 */

export class DashboardHeader {
  private readonly element: HTMLDivElement;
  private readonly statusElement: HTMLSpanElement;

  constructor(title: string = 'POSTING MAP CONTROL STATION') {
    this.element = document.createElement('div');
    this.element.className = 'dashboard-header';
    this.applyStyles();

    // Brand Label
    const brand = document.createElement('h1');
    brand.style.margin = '0';
    brand.style.fontSize = '20px';
    brand.style.fontWeight = '800';
    brand.style.letterSpacing = '-0.03em';
    brand.style.color = '#ffffff';
    brand.style.textTransform = 'uppercase';
    brand.innerText = title;

    // Right Side Status/Controls
    const rightSide = document.createElement('div');
    rightSide.style.display = 'flex';
    rightSide.style.alignItems = 'center';
    rightSide.style.gap = '16px';

    this.statusElement = document.createElement('span');
    this.statusElement.style.fontSize = '12px';
    this.statusElement.style.fontWeight = '700';
    this.statusElement.style.padding = '6px 12px';
    this.statusElement.style.borderRadius = '9999px';
    this.statusElement.style.transition = 'background 200ms easing, color 200ms easing';
    this.updateStatus('CONNECTED'); // デフォルト状態

    rightSide.appendChild(this.statusElement);
    this.element.appendChild(brand);
    this.element.appendChild(rightSide);
  }

  private applyStyles() {
    const s = this.element.style;
    s.display = 'flex';
    s.justifyContent = 'space-between';
    s.alignItems = 'center';
    s.padding = '20px 32px';
    s.background = 'rgba(0, 0, 0, 0.4)';
    s.backdropFilter = 'blur(10px)';
    s.setProperty('-webkit-backdrop-filter', 'blur(10px)');
    s.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
    s.width = '100%';
    s.boxSizing = 'border-box';
    s.fontFamily = 'Inter, sans-serif';
  }

  /**
   * 同期ステータスを動的に変更する (Real Data State反映)
   */
  updateStatus(state: 'LOADING' | 'CONNECTED' | 'ERROR') {
    const s = this.statusElement.style;
    switch (state) {
      case 'LOADING':
        this.statusElement.innerText = '● SYNCING';
        s.color = '#3b82f6';
        s.background = 'rgba(59, 130, 246, 0.1)';
        break;
      case 'CONNECTED':
        this.statusElement.innerText = '● LIVE';
        s.color = '#10b981';
        s.background = 'rgba(16, 185, 129, 0.1)';
        break;
      case 'ERROR':
        this.statusElement.innerText = '● ERROR';
        s.color = '#ef4444';
        s.background = 'rgba(239, 68, 68, 0.1)';
        break;
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}
