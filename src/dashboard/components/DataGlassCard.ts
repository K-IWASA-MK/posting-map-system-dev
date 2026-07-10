/**
 * DataGlassCard.ts
 * 
 * ダッシュボード共通のガラスモーフィズムカードコンポーネント。
 * 背景ブラー、多層影、半透明境界線、およびクリック時のスケール縮小フィードバックを備える。
 */

export class DataGlassCard {
  private readonly element: HTMLDivElement;

  constructor(title?: string, contentElement?: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'data-glass-card';
    this.applyStyles();

    if (title) {
      const header = document.createElement('div');
      header.className = 'glass-card-header';
      header.style.marginBottom = '12px';
      header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
      header.style.paddingBottom = '8px';

      const titleLabel = document.createElement('span');
      titleLabel.className = 'glass-card-title';
      titleLabel.style.fontSize = '14px';
      titleLabel.style.fontWeight = '700';
      titleLabel.style.letterSpacing = '0.05em';
      titleLabel.style.textTransform = 'uppercase';
      titleLabel.style.color = 'rgba(255, 255, 255, 0.6)';
      titleLabel.innerText = title;

      header.appendChild(titleLabel);
      this.element.appendChild(header);
    }

    if (contentElement) {
      this.element.appendChild(contentElement);
    }
  }

  private applyStyles() {
    const s = this.element.style;
    s.borderRadius = '28px';
    s.background = 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.008) 100%)';
    s.boxShadow = 'inset 0 0 0 1px rgba(120, 140, 255, 0.08), 0 0 30px rgba(37, 99, 235, 0.03)';
    s.backdropFilter = 'blur(20px)';
    s.setProperty('-webkit-backdrop-filter', 'blur(20px)');
    s.padding = '24px';
    s.border = 'none';
    s.color = '#ffffff';
    s.transition = 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 150ms cubic-bezier(0.16, 1, 0.3, 1)';
    s.cursor = 'pointer';
    s.position = 'relative';
    s.overflow = 'hidden';

    // Click = Animation & Hover feed back
    this.element.addEventListener('mouseenter', () => {
      s.transform = 'translateY(-2px) scale(1.01)';
      s.boxShadow = 'inset 0 0 0 1px rgba(120, 140, 255, 0.15), 0 10px 40px rgba(37, 99, 235, 0.08)';
    });

    this.element.addEventListener('mouseleave', () => {
      s.transform = 'translateY(0) scale(1)';
      s.boxShadow = 'inset 0 0 0 1px rgba(120, 140, 255, 0.08), 0 0 30px rgba(37, 99, 235, 0.03)';
    });

    this.element.addEventListener('mousedown', () => {
      s.transform = 'translateY(1px) scale(0.98)';
    });

    this.element.addEventListener('mouseup', () => {
      s.transform = 'translateY(-2px) scale(1.01)';
    });
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}
