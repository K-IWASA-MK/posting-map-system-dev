import { OperationalStatus } from './OperationalStatusManager';

/**
 * HealthIndicator.ts
 * 
 * ダッシュボードヘッダー等に表示するための、健康状態（Health）を表す UI インジケータコンポーネント。
 * ガラスモーフィズムと控えめな発光/アニメーション効果を適用。
 */

export class HealthIndicator {
  private element: HTMLDivElement;
  private dotElement: HTMLSpanElement;
  private labelElement: HTMLSpanElement;

  constructor() {
    this.element = document.createElement('div');
    this.applyStyles();

    this.dotElement = document.createElement('span');
    this.dotElement.className = 'health-indicator-dot';
    this.applyDotStyles();

    this.labelElement = document.createElement('span');
    this.labelElement.className = 'health-indicator-label';
    this.applyLabelStyles();

    this.element.appendChild(this.dotElement);
    this.element.appendChild(this.labelElement);
    this.injectStyles();
    this.updateStatus('NORMAL'); // デフォルト状態
  }

  /**
   * 生成された DOM 要素を取得する
   */
  getElement(): HTMLDivElement {
    return this.element;
  }

  /**
   * 現在の健康状態に合わせて色・バッジ・アニメーションを変更する
   */
  updateStatus(status: OperationalStatus): void {
    let color = '#10b981'; // Green
    let bg = 'rgba(16, 185, 129, 0.1)';
    let label = 'LIVE';
    let pulse = false;

    switch (status) {
      case 'NORMAL':
        color = '#10b981';
        bg = 'rgba(16, 185, 129, 0.08)';
        label = 'LIVE';
        break;
      case 'WARNING':
        color = '#f59e0b'; // Amber
        bg = 'rgba(245, 158, 11, 0.08)';
        label = 'WARNING';
        pulse = true;
        break;
      case 'ERROR':
        color = '#ef4444'; // Red
        bg = 'rgba(239, 68, 68, 0.08)';
        label = 'ERROR';
        pulse = true;
        break;
      case 'OFFLINE':
        color = '#6b7280'; // Grey
        bg = 'rgba(107, 114, 128, 0.08)';
        label = 'OFFLINE';
        break;
      case 'MAINTENANCE':
        color = '#3b82f6'; // Blue
        bg = 'rgba(59, 130, 246, 0.08)';
        label = 'MAINTENANCE';
        break;
    }

    this.labelElement.innerText = label;
    this.dotElement.style.color = color;
    
    // 背景・ボーダースタイル変更
    this.element.style.color = color;
    this.element.style.background = bg;
    this.element.style.borderColor = `rgba(${this.hexToRgb(color)}, 0.2)`;

    if (pulse) {
      this.dotElement.style.animation = 'health-indicator-pulse 1s infinite alternate ease-in-out';
    } else {
      this.dotElement.style.animation = 'none';
    }
  }

  private applyStyles(): void {
    const s = this.element.style;
    s.display = 'inline-flex';
    s.alignItems = 'center';
    s.gap = '8px';
    s.padding = '6px 14px';
    s.borderRadius = '9999px';
    s.border = '1px solid rgba(255,255,255,0.05)';
    s.fontFamily = 'Inter, sans-serif';
    s.fontSize = '12px';
    s.fontWeight = '700';
    s.letterSpacing = '0.05em';
    s.transition = 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)';
    s.backdropFilter = 'blur(10px)';
    s.setProperty('-webkit-backdrop-filter', 'blur(10px)');
  }

  private applyDotStyles(): void {
    const s = this.dotElement.style;
    s.display = 'inline-block';
    s.width = '8px';
    s.height = '8px';
    s.borderRadius = '50%';
    s.background = 'currentColor';
    s.boxShadow = '0 0 8px currentColor';
    s.transition = 'all 250ms ease';
  }

  private applyLabelStyles(): void {
    const s = this.labelElement.style;
    s.color = '#ffffff';
    s.fontSize = '11px';
    s.fontWeight = '800';
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  private injectStyles(): void {
    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      if (!document.getElementById('health-indicator-styles') && document.head && typeof document.head.appendChild === 'function') {
        const style = document.createElement('style');
        style.id = 'health-indicator-styles';
        style.innerHTML = `
          @keyframes health-indicator-pulse {
            0% { opacity: 0.4; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1.1); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
}
