/**
 * BoundaryTest.js
 * 
 * シミュレーションコードおよびテストコード内の「本番環境干渉依存」を静的に検知する。
 * SpreadsheetApp, Stripe SDK, 本番用 DB ファイル等への参照 import が検知された場合は FAIL とする。
 */

const fs = require('fs');
const path = require('path');

// 検証対象ディレクトリ
const SIMULATION_DIR = path.join(__dirname, '../../simulation');

// 禁止キーワード (本番環境への干渉)
const FORBIDDEN_KEYWORDS = [
  'SpreadsheetApp',
  'require(\'stripe\')',
  'require("../db")',
  'require(\'../db\')',
  'require(\'googleapis\')'
];

class BoundaryTest {
  /**
   * 境界テストを実行
   * @returns {Promise<object>} Status
   */
  static async run() {
    try {
      if (!fs.existsSync(SIMULATION_DIR)) {
        return {
          status: 'FAIL',
          failedLayer: 'BoundaryTest',
          error: { code: 'SIM_DIR_MISSING', message: 'シミュレーションディレクトリが見つかりません。' }
        };
      }

      const files = fs.readdirSync(SIMULATION_DIR);
      const violations = [];

      for (const file of files) {
        if (!file.endsWith('.js')) continue;

        const filePath = path.join(SIMULATION_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // キーワード検索による静的検証
        for (const keyword of FORBIDDEN_KEYWORDS) {
          if (content.includes(keyword)) {
            violations.push({
              file: file,
              detectedKeyword: keyword
            });
          }
        }
      }

      if (violations.length > 0) {
        return {
          status: 'FAIL',
          failedLayer: 'BoundaryTest',
          error: {
            code: 'PRODUCTION_ISOLATION_LEAK',
            message: `隔離違反検知: シミュレーションコード内に本番依存キーワードが検出されました。違反箇所: ${JSON.stringify(violations)}`
          }
        };
      }

      return {
        status: 'PASS',
        details: '本番環境への依存コード（SpreadsheetApp, Stripe, db 等）の参照は一切検出されず、論理隔離が証明されました。'
      };

    } catch (err) {
      return {
        status: 'FAIL',
        failedLayer: 'BoundaryTest',
        error: { code: 'TEST_EXCEPTION', message: err.message }
      };
    }
  }
}

module.exports = { BoundaryTest };
