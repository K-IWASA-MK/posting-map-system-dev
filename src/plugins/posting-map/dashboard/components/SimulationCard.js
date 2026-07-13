/**
 * SimulationCard.js
 * 
 * シミュレーション検証結果表示カード描画コンポーネント。
 */

class SimulationCard {
  /**
   * @param {object} props 
   * @param {string} props.lastRun シミュレーション最終実行時刻 (ISO文字列等)
   * @param {number} props.passed シミュレーション成功数
   * @param {number} props.failed シミュレーション失敗数
   * @param {number} props.delay 表示遅延
   * @returns {string} HTML文字列
   */
  static render(props) {
    const lastRunTime = props.lastRun ? new Date(props.lastRun).toLocaleTimeString() : '-';
    const isPass = props.failed === 0;

    const kpiProps = {
      title: 'Simulation Quality Gate',
      delay: props.delay || 0,
      items: [
        {
          label: 'Last Sim Result',
          value: lastRunTime,
          id: 'sim-last-result'
        },
        {
          label: 'Quality Gate Result',
          value: isPass ? 'PASS' : 'FAIL',
          colorClass: 'accent-blue',
          id: 'sim-gate-result'
        },
        {
          label: 'Scenario Status',
          value: `Passed: ${props.passed} / Failed: ${props.failed}`,
          id: 'sim-scenario-status'
        }
      ]
    };

    return window.KPICard.render(kpiProps);
  }
}

// グローバル公開
window.SimulationCard = SimulationCard;
