/**
 * ContractValidator.js
 * 
 * カーネルレイヤー間の接続契約（I/O スキーマ、必須項目、バージョン）を検証するバリデーター。
 * 契約違反（Contract Failure）検出時には決定論的に Failed 判定を出力する。
 */

class ContractValidator {
  /**
   * 契約（スキーマ・メタデータ）の定義
   */
  static get contracts() {
    return {
      'Execution->Review': {
        requiredFields: ['compiledFiles', 'buildTimestamp', 'version'],
        expectedTypes: {
          compiledFiles: 'object', // 配列(Array)もtypeofではobject
          buildTimestamp: 'string',
          version: 'string'
        },
        minVersion: 'v1.0.0'
      },
      'Review->Quality': {
        requiredFields: ['smellLevel', 'violations', 'version'],
        expectedTypes: {
          smellLevel: 'number',
          violations: 'object', // 配列(Array)
          version: 'string'
        },
        minVersion: 'v1.0.0'
      },
      'Quality->Learning': {
        requiredFields: ['overallScore', 'version'],
        expectedTypes: {
          overallScore: 'number',
          version: 'string'
        },
        minVersion: 'v1.0.0'
      },
      'Optimization->Governance': {
        requiredFields: ['healthIndex', 'mergeCandidates', 'version'],
        expectedTypes: {
          healthIndex: 'number',
          mergeCandidates: 'object',
          version: 'string'
        },
        minVersion: 'v1.0.0'
      }
    };
  }

  /**
   * レイヤー間のデータ受け渡し時に契約適合性を検証する
   * @param {string} connectionName 接続ペア名（例: 'Review->Quality'）
   * @param {object} data 検証データ (模擬カーネルの Output.payload)
   * @returns {object} ValidationResult
   */
  static validate(connectionName, data) {
    const contract = this.contracts[connectionName];
    if (!contract) {
      // 契約が未定義の場合は検証パス (Warning扱い)
      return { success: true, warning: 'NO_CONTRACT_DEFINED' };
    }

    if (!data || typeof data !== 'object') {
      return {
        success: false,
        error: { code: 'DATA_INVALID', message: '検証データがオブジェクトではありません。' }
      };
    }

    // 1. 必須フィールドのチェック (Required Fields)
    for (const field of contract.requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        return {
          success: false,
          error: {
            code: 'CONTRACT_FIELD_MISSING',
            message: `接続契約 [${connectionName}] に必要な必須フィールド '${field}' が欠落しています。`
          }
        };
      }

      // 2. 型チェック (Type Verification)
      const expectedType = contract.expectedTypes[field];
      if (typeof data[field] !== expectedType) {
        return {
          success: false,
          error: {
            code: 'CONTRACT_TYPE_MISMATCH',
            message: `フィールド '${field}' の型が一致しません。期待: ${expectedType}, 実際: ${typeof data[field]}`
          }
        };
      }
    }

    // 3. バージョン適合チェック (Version check)
    if (data.version !== contract.minVersion) {
      return {
        success: true,
        warning: `バージョン警告: 期待されるバージョンは ${contract.minVersion} ですが、実際は ${data.version} です。`
      };
    }

    return { success: true };
  }
}

module.exports = { ContractValidator };
