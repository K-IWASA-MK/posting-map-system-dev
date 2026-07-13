/**
 * VoteTurnoutVisualizer.ts
 * 
 * 過去3回の国政選挙の投票率履歴をグラフィカルに描画・表示制御するコンポーネント。
 * 直感的で確認しやすい縦並びプログレスバー形式で出力する。
 */

import { VoteTurnout } from '../DashboardStateModel';

export class VoteTurnoutVisualizer {
  private readonly container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'vote-turnout-visualizer';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = '12px';
  }

  /**
   * 投票率データを描画する
   */
  render(turnouts: readonly VoteTurnout[]) {
    this.container.innerHTML = '';

    if (turnouts.length === 0) {
      const empty = document.createElement('div');
      empty.innerText = 'データがありません。';
      empty.style.color = 'rgba(255, 255, 255, 0.3)';
      empty.style.fontSize = '12px';
      this.container.appendChild(empty);
      return;
    }

    // 日付順降順でソート（最新が一番上）
    const sorted = turnouts
      .slice()
      .sort((a, b) => b.electionDate.localeCompare(a.electionDate))
      .slice(0, 3); // 最大3回にローテーション制限

    sorted.forEach(turnout => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.gap = '4px';

      // Label (例: 2024 衆院選)
      const labelRow = document.createElement('div');
      labelRow.style.display = 'flex';
      labelRow.style.justifyContent = 'space-between';
      labelRow.style.fontSize = '12px';
      labelRow.style.fontWeight = '700';

      const electionName = document.createElement('span');
      electionName.innerText = `${turnout.electionId} (${turnout.electionType === 'HOUSE_OF_REPRESENTATIVES' ? '衆院選' : '参院選'})`;
      electionName.style.color = 'rgba(255, 255, 255, 0.7)';

      const rateVal = document.createElement('span');
      rateVal.innerText = `${(turnout.turnoutRate * 100).toFixed(1)}%`;
      rateVal.style.color = '#a855f7'; // 紫

      labelRow.appendChild(electionName);
      labelRow.appendChild(rateVal);

      // Progress Track
      const track = document.createElement('div');
      track.style.height = '6px';
      track.style.background = 'rgba(255, 255, 255, 0.05)';
      track.style.borderRadius = '3px';
      track.style.position = 'relative';
      track.style.overflow = 'hidden';

      // Progress Bar
      const bar = document.createElement('div');
      bar.style.height = '100%';
      bar.style.width = '0%'; // 初期値0
      bar.style.background = 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)';
      bar.style.borderRadius = '3px';
      bar.style.transition = 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)';

      // National Average Line (全国平均点線マーカー)
      const averageMarker = document.createElement('div');
      averageMarker.style.position = 'absolute';
      averageMarker.style.top = '0';
      averageMarker.style.bottom = '0';
      averageMarker.style.left = `${turnout.nationalAverage * 100}%`;
      averageMarker.style.width = '2px';
      averageMarker.style.borderLeft = '1px dashed rgba(255, 255, 255, 0.3)';
      averageMarker.title = `全国平均: ${(turnout.nationalAverage * 100).toFixed(1)}%`;

      track.appendChild(bar);
      track.appendChild(averageMarker);

      item.appendChild(labelRow);
      item.appendChild(track);
      this.container.appendChild(item);

      // Trigger width animation on next tick
      setTimeout(() => {
        bar.style.width = `${turnout.turnoutRate * 100}%`;
      }, 50);
    });
  }

  getElement(): HTMLDivElement {
    return this.container;
  }
}
