/**
 * BillingCard.js
 * 
 * 契約ライセンス表示カード描画コンポーネント。
 */

class BillingCard {
  /**
   * @param {object} props 
   * @param {string} props.licenseStatus ライセンス認可状態 (Authorized等)
   * @param {string} props.subscriptionStatus サブスクリプション状態 (active等)
   * @param {number} props.delay 表示遅延
   * @returns {string} HTML文字列
   */
  static render(props) {
    const kpiProps = {
      title: 'Billing Metrics',
      delay: props.delay || 0,
      items: [
        {
          label: 'License Status',
          value: props.licenseStatus,
          colorClass: 'accent-green',
          id: 'bill-license'
        },
        {
          label: 'Subscription Status',
          value: props.subscriptionStatus,
          id: 'bill-subscription'
        },
        {
          label: 'Payment Event Status',
          value: 'System Payment: Succeeded',
          id: 'bill-payment'
        }
      ]
    };

    return window.KPICard.render(kpiProps);
  }
}

// グローバル公開
window.BillingCard = BillingCard;
