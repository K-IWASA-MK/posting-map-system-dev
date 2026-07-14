import { HealthIndicator } from '../operations/HealthIndicator';
import { OperationalStatus } from '../operations/OperationalStatusManager';

/**
 * DashboardHeader.ts
 * 
 * ダッシュボードヘッダーコンポーネント。
 * ブランド表示、ナビゲーション、API同期ステータス（HealthIndicator）、
 * 同期メトリクス表示、およびキャッシュ全無効化を伴う強制更新（Force Refresh）制御を担当。
 */

export class DashboardHeader {
  private readonly element: HTMLDivElement;
  private readonly healthIndicator: HealthIndicator;
  private readonly metricsElement: HTMLDivElement;
  private coordinator: any = null;

  // 後方互換性用のダミー要素
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
    rightSide.style.gap = '24px';

    // 1. 同期メトリクス表示領域
    this.metricsElement = document.createElement('div');
    this.metricsElement.style.color = '#ffffff';
    this.metricsElement.style.fontSize = '11px';
    this.metricsElement.style.fontFamily = 'monospace';
    this.metricsElement.style.display = 'flex';
    this.metricsElement.style.alignItems = 'center';
    this.updateMetrics({ lastSyncTime: 0, lastSyncDuration: -1, lastRetryCount: 0 });

    // 2. ヘルスインジケータ
    this.healthIndicator = new HealthIndicator();

    // 後方互換用の非表示ステータス要素
    this.statusElement = document.createElement('span');
    this.statusElement.style.display = 'none';

    // 3. 強制更新（Force Refresh）ボタン
    const forceRefreshBtn = document.createElement('button');
    forceRefreshBtn.className = 'force-refresh-button';
    forceRefreshBtn.innerText = 'FORCE REFRESH';
    this.applyButtonStyles(forceRefreshBtn);
    
    forceRefreshBtn.addEventListener('click', () => {
      console.log('[DashboardHeader] Force Refresh requested.');
      if (this.coordinator) {
        this.coordinator.emit('refresh-requested');
      }
    });

    rightSide.appendChild(this.metricsElement);
    rightSide.appendChild(this.healthIndicator.getElement());
    rightSide.appendChild(this.statusElement);
    rightSide.appendChild(forceRefreshBtn);

    this.element.appendChild(brand);
    this.element.appendChild(rightSide);
  }

  setCoordinator(coordinator: any): void {
    this.coordinator = coordinator;
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

  private applyButtonStyles(btn: HTMLButtonElement) {
    const s = btn.style;
    s.background = 'transparent';
    s.border = '1px solid rgba(255, 255, 255, 0.15)';
    s.borderRadius = '8px';
    s.color = '#ffffff';
    s.fontSize = '10px';
    s.fontWeight = '800';
    s.letterSpacing = '0.05em';
    s.padding = '8px 16px';
    s.cursor = 'pointer';
    s.transition = 'all 200ms ease';

    btn.addEventListener('mouseover', () => {
      s.background = 'rgba(255, 255, 255, 0.05)';
      s.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    btn.addEventListener('mouseout', () => {
      s.background = 'transparent';
      s.borderColor = 'rgba(255, 255, 255, 0.15)';
    });
  }

  /**
   * 同期ステータスを動的に変更する (後方互換用)
   */
  updateStatus(state: 'LOADING' | 'CONNECTED' | 'ERROR') {
    switch (state) {
      case 'LOADING':
        this.healthIndicator.updateStatus('MAINTENANCE'); // 代替表示
        break;
      case 'CONNECTED':
        this.healthIndicator.updateStatus('NORMAL');
        break;
      case 'ERROR':
        this.healthIndicator.updateStatus('ERROR');
        break;
    }
  }

  /**
   * ヘルス状態を更新する
   */
  updateHealth(status: OperationalStatus): void {
    this.healthIndicator.updateStatus(status);
  }

  /**
   * 運用メトリクスの表示を更新する
   */
  updateMetrics(metrics: { lastSyncTime: number; lastSyncDuration: number; lastRetryCount: number }): void {
    const timeStr = metrics.lastSyncTime > 0 
      ? new Date(metrics.lastSyncTime).toLocaleTimeString() 
      : '--:--:--';
    const durationStr = metrics.lastSyncDuration >= 0 
      ? `${(metrics.lastSyncDuration / 1000).toFixed(2)}s` 
      : '--';
    
    this.metricsElement.innerHTML = `
      <span style="opacity: 0.4; margin-right: 4px;">SYNC:</span> <strong>${timeStr}</strong>
      <span style="opacity: 0.1; margin: 0 8px;">|</span>
      <span style="opacity: 0.4; margin-right: 4px;">DURATION:</span> <strong>${durationStr}</strong>
      <span style="opacity: 0.1; margin: 0 8px;">|</span>
      <span style="opacity: 0.4; margin-right: 4px;">RETRIES:</span> <strong>${metrics.lastRetryCount}</strong>
    `;
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}
