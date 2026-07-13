/**
 * DashboardLayout.ts
 * 
 * ダッシュボードの親レイアウトコンポーネント。
 * ヘッダー、地図、詳細パネル、情報カードなどを配置し、
 * DashboardStateModel から流れる実データと同期させる。
 */

import { DashboardStateModel } from '../DashboardStateModel';
import { DashboardHeader } from './DashboardHeader';
import { MapPanel } from './MapPanel';
import { AreaDetailPanel } from './AreaDetailPanel';
import { DataGlassCard } from './DataGlassCard';

export class DashboardLayout {
  private readonly container: HTMLDivElement;
  private readonly model: DashboardStateModel;

  private readonly header: DashboardHeader;
  private readonly mapPanel: MapPanel;
  private readonly detailPanel: AreaDetailPanel;
  
  private readonly statsContainer: HTMLDivElement;

  constructor(model: DashboardStateModel) {
    this.model = model;

    this.container = document.createElement('div');
    this.container.className = 'dashboard-premium-layout';
    this.applyStyles();

    // 1. Header
    this.header = new DashboardHeader();
    this.container.appendChild(this.header.getElement());

    // Main workspace content layout
    const contentArea = document.createElement('div');
    contentArea.style.display = 'flex';
    contentArea.style.gap = '24px';
    contentArea.style.padding = '32px';
    contentArea.style.flex = '1';
    contentArea.style.position = 'relative';
    contentArea.style.boxSizing = 'border-box';
    contentArea.style.width = '100%';

    // Left Column: Map & Analytics Overview
    const leftCol = document.createElement('div');
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.gap = '24px';
    leftCol.style.flex = '1';

    this.mapPanel = new MapPanel();
    leftCol.appendChild(this.mapPanel.getElement());

    // Stats Grid
    this.statsContainer = document.createElement('div');
    this.statsContainer.style.display = 'grid';
    this.statsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    this.statsContainer.style.gap = '20px';
    leftCol.appendChild(this.statsContainer);

    contentArea.appendChild(leftCol);

    // Right Column Detail Panel (Slide overlay)
    this.detailPanel = new AreaDetailPanel();
    contentArea.appendChild(this.detailPanel.getElement());

    this.container.appendChild(contentArea);

    // Bind Area selection
    this.mapPanel.onAreaSelected((areaId) => {
      this.handleAreaSelected(areaId);
    });

    // Subscribe to State Model Changes
    this.model.subscribe(() => {
      this.render();
    });
  }

  private applyStyles() {
    const s = this.container.style;
    s.display = 'flex';
    s.flexDirection = 'column';
    s.background = '#000000'; // 漆黒背景
    s.minHeight = '100vh';
    s.color = '#ffffff';
    s.fontFamily = 'Inter, sans-serif';
    s.position = 'relative';
    s.overflow = 'hidden';
  }

  /**
   * 地区ピン選択時の非同期ローテーション＆詳細パネル更新処理
   */
  private async handleAreaSelected(areaId: string) {
    const data = this.model.getData();
    if (!data) return;

    const area = data.areas.find(a => a.areaId === areaId);
    if (!area) return;

    // 非同期で投票率マスタと活動履歴をロード
    await Promise.all([
      this.model.loadVoteTurnout(areaId),
      this.model.loadEventLogs(20) // 直近20件
    ]);

    this.detailPanel.updateDetails(area, this.model.getVoteTurnouts(), this.model.getEventLogs());
  }

  /**
   * UI のレンダリング更新 (Real Data Binding)
   */
  render() {
    // 1. Update Sync Header Status
    if (this.model.getIsLoading()) {
      this.header.updateStatus('LOADING');
    } else if (this.model.getError()) {
      this.header.updateStatus('ERROR');
    } else {
      this.header.updateStatus('CONNECTED');
    }

    const data = this.model.getData();
    if (!data) {
      this.renderEmptyState();
      return;
    }

    // 2. Render Map Panels
    this.mapPanel.updateAreas(data.areas);

    // 3. Render Stats Summary Cards (DataGlassCard integration)
    this.statsContainer.innerHTML = '';

    // Total Household spec
    const hhCardContent = this.createStatContent('TOTAL TARGET HOUSEHOLDS', `${data.stats.totalHouseholds.toLocaleString()} 世帯`);
    const hhCard = new DataGlassCard('', hhCardContent);
    this.statsContainer.appendChild(hhCard.getElement());

    // Done Count spec
    const doneCardContent = this.createStatContent('TOTAL COPIES DISTRIBUTED', `${data.stats.totalCompleted.toLocaleString()} 枚`);
    const doneCard = new DataGlassCard('', doneCardContent);
    this.statsContainer.appendChild(doneCard.getElement());

    // Progress percentage
    const progressCardContent = this.createStatContent('OVERALL PROGRESS RATE', `${data.stats.progressRate}%`);
    const progressCard = new DataGlassCard('', progressCardContent);
    this.statsContainer.appendChild(progressCard.getElement());
  }

  private renderEmptyState() {
    this.statsContainer.innerHTML = '';
    const error = this.model.getError();
    
    const wrapper = document.createElement('div');
    wrapper.style.gridColumn = '1 / -1';
    wrapper.style.padding = '40px';
    wrapper.style.textAlign = 'center';

    const card = new DataGlassCard('', wrapper);
    
    if (error) {
      wrapper.innerHTML = `
        <h3 style="color: #ef4444; margin-bottom: 8px;">システムエラー</h3>
        <p style="color: rgba(255,255,255,0.6); font-size: 14px;">${error.message}</p>
      `;
    } else {
      wrapper.innerHTML = `
        <h3 style="margin-bottom: 8px;">データがありません</h3>
        <p style="color: rgba(255,255,255,0.6); font-size: 14px;">ロードを実行してデータを取得してください。</p>
      `;
    }

    this.statsContainer.appendChild(card.getElement());
  }

  private createStatContent(label: string, value: string): HTMLDivElement {
    const wrapper = document.createElement('div');
    
    const labelEl = document.createElement('div');
    labelEl.style.fontSize = '11px';
    labelEl.style.fontWeight = '700';
    labelEl.style.color = 'rgba(255, 255, 255, 0.4)';
    labelEl.style.letterSpacing = '0.08em';
    labelEl.style.marginBottom = '6px';
    labelEl.innerText = label;

    const valueEl = document.createElement('div');
    valueEl.style.fontSize = '28px';
    valueEl.style.fontWeight = '800';
    valueEl.style.color = '#ffffff';
    valueEl.innerText = value;

    wrapper.appendChild(labelEl);
    wrapper.appendChild(valueEl);
    return wrapper;
  }

  getElement(): HTMLDivElement {
    return this.container;
  }
}
