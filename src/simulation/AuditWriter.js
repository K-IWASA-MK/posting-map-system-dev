/**
 * AuditWriter.js
 * 
 * 統合シミュレーションの監査記録（Append-Only）を保存するライターモジュール。
 * 削除（Delete）や更新（Update）の操作は完全に遮断される。
 */

const fs = require('fs');
const path = require('path');

// 監査ログの保存先ファイル（本番AIOSとは完全に分離）
const AUDIT_LOG_FILE = path.join(__dirname, '../../tools/simulation_audit.log');

class AuditWriter {
  /**
   * 監査ログにレコードを追記（Append-Only）する
   * @param {string} simulationId 
   * @param {string} eventType 
   * @param {object} details 
   */
  static async write(simulationId, eventType, details) {
    const auditRecord = {
      auditLogId: `SIM-AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      simulationId,
      timestamp: new Date().toISOString(),
      eventType,
      details
    };

    // JSON Line 形式で追記
    const logLine = JSON.stringify(auditRecord) + '\n';
    
    // ディレクトリが存在することを確認して追記
    const dir = path.dirname(AUDIT_LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFileSync(AUDIT_LOG_FILE, logLine, 'utf8');
  }
}

module.exports = { AuditWriter };
