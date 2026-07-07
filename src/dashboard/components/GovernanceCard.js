/**
 * GovernanceCard.js
 * 
 * ガバナンス・承認ポリシー監査カード描画コンポーネント。
 */

class GovernanceCard {
  /**
   * @param {object} props 
   * @param {number} props.pendingApproval 承認待ち件数 (2等)
   * @param {number} props.approvedCount 承認済み件数 (84等)
   * @param {number} props.auditCount 監査回数 (89等)
   * @param {number} props.delay 表示遅延
   * @returns {string} HTML文字列
   */
  static render(props) {
    const kpiProps = {
      title: 'Governance Metrics',
      delay: props.delay || 0,
      items: [
        {
          label: 'Pending Approval',
          value: props.pendingApproval,
          id: 'gov-pending'
        },
        {
          label: 'Approved',
          value: props.approvedCount,
          colorClass: 'accent-green',
          id: 'gov-approved'
        },
        {
          label: 'Rejected',
          value: '0', // 拒否数 (モック固定)
          id: 'gov-rejected'
        },
        {
          label: 'Audit Count',
          value: `Total Audits: ${props.auditCount}`,
          id: 'gov-audit'
        }
      ]
    };

    return window.KPICard.render(kpiProps);
  }
}

// グローバル公開
window.GovernanceCard = GovernanceCard;
