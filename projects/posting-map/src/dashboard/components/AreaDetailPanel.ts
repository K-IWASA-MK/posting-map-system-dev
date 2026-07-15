/**
 * AreaDetailPanel.ts
 * 
 * 地区選択時にスライドイン＆フェードイン展開する詳細情報パネル。
 * 地区スペック、直近3回の選挙投票率履歴（VoteTurnout）、配布活動履歴を表示する。
 */

import { AreaDetail, VoteTurnout, EventLogItem } from '../DashboardStateModel';

export class AreaDetailPanel {
  private readonly element: HTMLDivElement;
  private readonly titleElement: HTMLHeadingElement;
  private readonly specContainer: HTMLDivElement;
  private readonly fieldContainer: HTMLDivElement;
  private readonly turnoutContainer: HTMLDivElement;
  private readonly eventContainer: HTMLDivElement;
  private readonly closeButton: HTMLButtonElement;

  private isVisible: boolean = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'area-detail-panel';
    this.applyStyles();

    // Close Button
    this.closeButton = document.createElement('button');
    this.closeButton.innerText = '✕ CLOSE';
    this.applyCloseButtonStyles();
    this.closeButton.addEventListener('click', () => this.hide());
    this.element.appendChild(this.closeButton);

    // Title
    this.titleElement = document.createElement('h2');
    this.titleElement.style.margin = '0 0 24px 0';
    this.titleElement.style.fontSize = '24px';
    this.titleElement.style.fontWeight = '800';
    this.titleElement.style.color = '#ffffff';
    this.element.appendChild(this.titleElement);

    // Section 1: Specs
    const specHeader = this.createSectionHeader('SPECIFICATIONS');
    this.element.appendChild(specHeader);
    this.specContainer = document.createElement('div');
    this.specContainer.style.marginBottom = '24px';
    this.element.appendChild(this.specContainer);

    // Section 1.5: Field Operations
    const fieldHeader = this.createSectionHeader('FIELD EVIDENCE (現場運用・証跡)');
    this.element.appendChild(fieldHeader);
    this.fieldContainer = document.createElement('div');
    this.fieldContainer.style.marginBottom = '24px';
    this.element.appendChild(this.fieldContainer);

    // Section 2: Turnout (過去3回選挙履歴)
    const turnoutHeader = this.createSectionHeader('HISTORICAL TURNOUT (直近3回国政選挙)');
    this.element.appendChild(turnoutHeader);
    this.turnoutContainer = document.createElement('div');
    this.turnoutContainer.style.marginBottom = '24px';
    this.element.appendChild(this.turnoutContainer);

    // Section 3: Event Log
    const eventHeader = this.createSectionHeader('RECENT ACTIVITIES');
    this.element.appendChild(eventHeader);
    this.eventContainer = document.createElement('div');
    this.element.appendChild(this.eventContainer);
  }

  private applyStyles() {
    const s = this.element.style;
    s.position = 'absolute';
    s.top = '0';
    s.right = '-420px'; // 初期状態は枠外
    s.width = '380px';
    s.height = '100%';
    s.background = 'linear-gradient(180deg, rgba(15, 15, 20, 0.95) 0%, rgba(10, 10, 12, 0.98) 100%)';
    s.backdropFilter = 'blur(30px)';
    s.setProperty('-webkit-backdrop-filter', 'blur(30px)');
    s.borderLeft = '1px solid rgba(120, 140, 255, 0.1)';
    s.padding = '32px';
    s.boxSizing = 'border-box';
    s.overflowY = 'auto';
    s.zIndex = '100';
    s.transition = 'right 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)';
    s.opacity = '0';
    s.boxShadow = '-10px 0 40px rgba(0, 0, 0, 0.5)';
  }

  private applyCloseButtonStyles() {
    const s = this.closeButton.style;
    s.position = 'absolute';
    s.top = '24px';
    s.right = '24px';
    s.background = 'rgba(255, 255, 255, 0.05)';
    s.border = '1px solid rgba(255, 255, 255, 0.08)';
    s.borderRadius = '9999px';
    s.color = 'rgba(255, 255, 255, 0.6)';
    s.padding = '6px 12px';
    s.fontSize = '10px';
    s.fontWeight = '700';
    s.cursor = 'pointer';
    s.transition = 'all 150ms ease';

    this.closeButton.addEventListener('mouseenter', () => {
      s.background = 'rgba(255, 255, 255, 0.1)';
      s.color = '#ffffff';
    });
    this.closeButton.addEventListener('mouseleave', () => {
      s.background = 'rgba(255, 255, 255, 0.05)';
      s.color = 'rgba(255, 255, 255, 0.6)';
    });
  }

  private createSectionHeader(title: string): HTMLDivElement {
    const div = document.createElement('div');
    div.style.fontSize = '11px';
    div.style.fontWeight = '800';
    div.style.letterSpacing = '0.08em';
    div.style.color = 'rgba(255, 255, 255, 0.3)';
    div.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
    div.style.paddingBottom = '6px';
    div.style.marginBottom = '12px';
    div.style.textTransform = 'uppercase';
    div.innerText = title;
    return div;
  }

  show() {
    this.isVisible = true;
    this.element.style.right = '0';
    this.element.style.opacity = '1';
  }

  hide() {
    this.isVisible = false;
    this.element.style.right = '-420px';
    this.element.style.opacity = '0';
  }

  /**
   * 地区スペック・投票率履歴・活動履歴のバインド更新
   */
  updateDetails(area: AreaDetail, turnouts: readonly VoteTurnout[], logs: readonly EventLogItem[]) {
    // Title
    this.titleElement.innerText = area.areaName;

    // 1. Specs
    this.specContainer.innerHTML = '';
    const specs = [
      { label: '地区コード', val: area.areaId },
      { label: '所属市区町村', val: area.cityName || '未設定' },
      { label: '目標世帯数', val: `${area.totalHouseholds.toLocaleString()} 世帯` },
      { label: '配布完了数', val: `${area.doneCount.toLocaleString()} 枚` }
    ];
    specs.forEach(spec => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.fontSize = '13px';
      row.style.marginBottom = '8px';

      const label = document.createElement('span');
      label.style.color = 'rgba(255, 255, 255, 0.5)';
      label.innerText = spec.label;

      const val = document.createElement('span');
      val.style.fontWeight = '700';
      val.innerText = spec.val;

      row.appendChild(label);
      row.appendChild(val);
      this.specContainer.appendChild(row);
    });

    // 1.5. Field Operations Spec Rendering
    const areaLogs = logs.filter(l => l.areaId === area.areaId);

    let distStatus = 'NOT_STARTED';
    if (area.doneCount >= area.totalHouseholds) {
      distStatus = 'COMPLETED';
    } else if (area.doneCount > 0) {
      distStatus = 'IN_PROGRESS';
    }
    
    try {
      const app = (globalThis as any).window?.DashboardApplication?.getInstance?.();
      if (app) {
        const ctrl = app.getFieldOperationController?.();
        if (ctrl) {
          distStatus = ctrl.statusManager.getStatus(area.areaId, area);
        }
      }
    } catch (e) {}

    let gpsText = '測位なし';
    const gpsLog = areaLogs.find(l => typeof l.latitude === 'number' && typeof l.longitude === 'number' && l.latitude !== 0 && l.longitude !== 0);
    if (gpsLog) {
      gpsText = new Date(gpsLog.timestamp).toLocaleTimeString('ja-JP');
    }

    let photoText = '提出なし';
    let photoUrl = '';
    const photoLog = areaLogs.find(l => l.meta && (l.meta.photoUrl || l.meta.photo_url));
    if (photoLog) {
      photoText = new Date(photoLog.timestamp).toLocaleTimeString('ja-JP');
      photoUrl = photoLog.meta.photoUrl || photoLog.meta.photo_url;
    }

    this.fieldContainer.innerHTML = '';
    
    const fieldRows: { label: string; val: string; isBadge?: boolean; link?: string; color?: string; }[] = [
      { label: '活動状況', val: distStatus, isBadge: true },
      { label: '最新GPS位置取得', val: gpsText },
      { label: '最新写真証跡', val: photoText, link: photoUrl }
    ];

    fieldRows.forEach(row => {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.justifyContent = 'space-between';
      el.style.alignItems = 'center';
      el.style.fontSize = '13px';
      el.style.marginBottom = '10px';
      el.style.background = 'rgba(255,255,255,0.01)';
      el.style.padding = '8px 12px';
      el.style.borderRadius = '8px';
      el.style.border = '1px solid rgba(255,255,255,0.02)';

      const label = document.createElement('span');
      label.style.color = 'rgba(255, 255, 255, 0.5)';
      label.innerText = row.label;

      const valContainer = document.createElement('span');
      
      if (row.isBadge) {
        const badge = document.createElement('span');
        badge.innerText = row.val;
        badge.style.fontSize = '10px';
        badge.style.fontWeight = '800';
        badge.style.padding = '3px 8px';
        badge.style.borderRadius = '9999px';
        badge.style.letterSpacing = '0.05em';
        
        let bg = 'rgba(107, 114, 128, 0.1)';
        let fg = '#6b7280';
        if (row.val === 'IN_PROGRESS') {
          bg = 'rgba(245, 158, 11, 0.1)';
          fg = '#f59e0b';
        } else if (row.val === 'COMPLETED') {
          bg = 'rgba(16, 185, 129, 0.1)';
          fg = '#10b981';
        } else if (row.val === 'PAUSED') {
          bg = 'rgba(59, 130, 246, 0.1)';
          fg = '#3b82f6';
        }
        badge.style.background = bg;
        badge.style.color = fg;
        badge.style.border = `1px solid rgba(${this.hexToRgb(fg)}, 0.2)`;
        valContainer.appendChild(badge);
      } else if (row.link) {
        const link = document.createElement('a');
        link.href = row.link;
        link.target = '_blank';
        link.innerText = `表示 (${row.val})`;
        link.style.color = '#3b82f6';
        link.style.textDecoration = 'none';
        link.style.fontWeight = '700';
        link.addEventListener('mouseover', () => link.style.textDecoration = 'underline');
        link.addEventListener('mouseout', () => link.style.textDecoration = 'none');
        valContainer.appendChild(link);
      } else {
        valContainer.style.fontWeight = '700';
        if (row.color) {
          valContainer.style.color = row.color;
        }
        valContainer.innerText = row.val;
      }

      el.appendChild(label);
      el.appendChild(valContainer);
      this.fieldContainer.appendChild(el);
    });

    // 2. Turnouts (過去3回選挙履歴)
    this.turnoutContainer.innerHTML = '';
    const filteredTurnouts = turnouts.filter(t => t.areaId === area.areaId);
    
    if (filteredTurnouts.length === 0) {
      const nodata = document.createElement('div');
      nodata.innerText = '登録済みの投票率データがありません。';
      nodata.style.color = 'rgba(255, 255, 255, 0.3)';
      nodata.style.fontSize = '12px';
      this.turnoutContainer.appendChild(nodata);
    } else {
      filteredTurnouts.forEach(turnout => {
        const item = document.createElement('div');
        item.style.background = 'rgba(255,255,255,0.02)';
        item.style.border = '1px solid rgba(255,255,255,0.04)';
        item.style.borderRadius = '16px';
        item.style.padding = '12px 16px';
        item.style.marginBottom = '8px';

        const name = document.createElement('div');
        name.style.fontSize = '12px';
        name.style.fontWeight = '700';
        name.innerText = `${turnout.electionId} (${turnout.electionType === 'HOUSE_OF_REPRESENTATIVES' ? '衆院選' : '参院選'})`;

        const rates = document.createElement('div');
        rates.style.display = 'flex';
        rates.style.justifyContent = 'space-between';
        rates.style.fontSize = '14px';
        rates.style.marginTop = '4px';

        const rateLabel = document.createElement('span');
        rateLabel.style.color = '#3b82f6';
        rateLabel.style.fontWeight = '800';
        rateLabel.innerText = `投票率: ${(turnout.turnoutRate * 100).toFixed(1)}%`;

        const avgLabel = document.createElement('span');
        avgLabel.style.color = 'rgba(255, 255, 255, 0.4)';
        avgLabel.style.fontSize = '11px';
        avgLabel.innerText = `全国平均: ${(turnout.nationalAverage * 100).toFixed(1)}%`;

        rates.appendChild(rateLabel);
        rates.appendChild(avgLabel);
        item.appendChild(name);
        item.appendChild(rates);
        this.turnoutContainer.appendChild(item);
      });
    }

    // 3. Activities
    this.eventContainer.innerHTML = '';
    const filteredLogs = logs.filter(l => l.areaId === area.areaId).slice(0, 5); // 直近5件

    if (filteredLogs.length === 0) {
      const nodata = document.createElement('div');
      nodata.innerText = '該当エリアの最近の活動記録はありません。';
      nodata.style.color = 'rgba(255, 255, 255, 0.3)';
      nodata.style.fontSize = '12px';
      this.eventContainer.appendChild(nodata);
    } else {
      filteredLogs.forEach(log => {
        const item = document.createElement('div');
        item.style.fontSize = '12px';
        item.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
        item.style.padding = '8px 0';

        const time = document.createElement('div');
        time.style.color = 'rgba(255, 255, 255, 0.3)';
        time.innerText = new Date(log.timestamp).toLocaleString('ja-JP');

        const desc = document.createElement('div');
        desc.style.fontWeight = '700';
        desc.style.marginTop = '2px';
        desc.innerText = `${log.memberId} が配布完了: ${log.count.toLocaleString()} 枚`;

        item.appendChild(time);
        item.appendChild(desc);
        this.eventContainer.appendChild(item);
      });
    }

    this.show();
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  private hexToRgb(hex: string): string {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return `${r},${g},${b}`;
  }
}
