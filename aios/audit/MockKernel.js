/**
 * MockKernel.js
 * 
 * AIOS の各カーネルエンジンを模した模擬モジュール群。
 * 本番の処理（Spreadsheet、外部API等）を一切呼び出さず、接続確認用の模擬データを入出力する。
 */

class MockExecutionKernel {
  static execute(input) {
    if (input.triggerError) {
      return {
        status: 'Failed',
        error: { code: 'SYNTAX_ERROR', message: '模擬文法エラー検出' }
      };
    }
    return {
      status: 'Success',
      payload: {
        compiledFiles: input.files || [],
        buildTimestamp: new Date().toISOString(),
        version: input.version || 'v1.0.0'
      }
    };
  }
}

class MockReviewKernel {
  static execute(input) {
    const payload = input.payload || {};
    if (payload.compiledFiles && payload.compiledFiles.includes('smelly_code.js')) {
      return {
        status: 'Success',
        payload: {
          smellLevel: 2,
          violations: ['AI_SMELL_LEVEL_2'],
          version: payload.version || 'v1.0.0'
        }
      };
    }
    return {
      status: 'Success',
      payload: {
        smellLevel: 0,
        violations: [],
        version: payload.version || 'v1.0.0'
      }
    };
  }
}

class MockQualityKernel {
  static execute(input) {
    const payload = input.payload || {};
    let score = 95;
    if (payload.smellLevel >= 2) {
      score = 65; // 不適合スコア
    }
    return {
      status: score >= 70 ? 'Success' : 'Failed',
      payload: {
        overallScore: score,
        version: payload.version || 'v1.0.0'
      }
    };
  }
}

class MockSelfReviewKernel {
  static execute(input) {
    return {
      status: 'Success',
      payload: {
        reviewComments: ['AI Smell Level 2 違反による要修正'],
        version: input.version || 'v1.0.0'
      }
    };
  }
}

class MockSelfImprovementKernel {
  static execute(input) {
    return {
      status: 'Success',
      payload: {
        improvementPlan: '改善パッチ適用推奨',
        version: input.version || 'v1.0.0'
      }
    };
  }
}

class MockLearningKernel {
  static execute(input) {
    return {
      status: 'Success',
      payload: {
        learnedPattern: 'Smellyパターン回避策の学習',
        version: input.version || 'v1.0.0'
      }
    };
  }
}

class MockOptimizationKernel {
  static execute(input) {
    return {
      status: 'Success',
      payload: {
        healthIndex: 88,
        mergeCandidates: [],
        version: input.version || 'v1.0.0'
      }
    };
  }
}

class MockGovernanceKernel {
  static execute(input) {
    // 特権昇格や本番承認を行わない隔離チェック
    const payload = input.payload || {};
    if (input.licenseStatus === 'Suspended') {
      return {
        status: 'Failed',
        error: { code: 'LICENSE_SUSPENDED', message: '模擬ライセンス停止中' }
      };
    }
    if (input.requiresApproval) {
      return {
        status: 'Pending',
        payload: {
          gateId: 'GATE-MOCK-001',
          approved: false,
          version: payload.version || 'v1.0.0'
        }
      };
    }
    return {
      status: 'Success',
      payload: {
        governanceDecisionId: 'DEC-MOCK-999',
        version: payload.version || 'v1.0.0'
      }
    };
  }
}

class MockBillingKernel {
  static execute(input) {
    // Stripe接続・実決済を一切行わない完全な模擬データ出力
    if (input.triggerMockPaymentFailed) {
      return {
        status: 'Failed',
        error: { code: 'MOCK_PAYMENT_FAILED', message: '模擬決済失敗' }
      };
    }
    return {
      status: 'Success',
      payload: {
        subscriptionStatus: input.mockSubscriptionStatus || 'Active',
        licenseStatus: input.mockLicenseStatus || 'Active',
        version: input.version || 'v1.0.0'
      }
    };
  }
}

module.exports = {
  MockExecutionKernel,
  MockReviewKernel,
  MockQualityKernel,
  MockSelfReviewKernel,
  MockSelfImprovementKernel,
  MockLearningKernel,
  MockOptimizationKernel,
  MockGovernanceKernel,
  MockBillingKernel
};
