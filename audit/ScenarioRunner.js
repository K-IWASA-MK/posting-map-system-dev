/**
 * ScenarioRunner.js
 * 
 * テストシナリオ（Normal, Error, Approval）を実行するステートマシン。
 * 各模擬エンジン間の接続整合性を検証し、不整合（Contract Failure）時は即座に処理を中断する。
 */

const {
  MockExecutionKernel,
  MockReviewKernel,
  MockQualityKernel,
  MockSelfReviewKernel,
  MockSelfImprovementKernel,
  MockLearningKernel,
  MockOptimizationKernel,
  MockGovernanceKernel,
  MockBillingKernel
} = require('./MockKernel');

const { ContractValidator } = require('./ContractValidator');
const { AuditWriter } = require('./AuditWriter');

class ScenarioRunner {
  constructor(simulationId, scenarioId) {
    this.simulationId = simulationId;
    this.scenarioId = scenarioId;
  }

  /**
   * シナリオを実行する
   * @returns {Promise<object>} Status & Details
   */
  async execute() {
    switch (this.scenarioId) {
      case 'SCN-NORMAL-001':
        return await this.runNormalFlow();
      case 'SCN-ERROR-001':
        return await this.runErrorFlow();
      case 'SCN-APPROVAL-001':
        return await this.runApprovalFlow();
      case 'SCN-CONTRACT-FAIL-001':
        return await this.runContractFailureTest();
      case 'SCN-BILLING-ISOLATION-001':
        return await this.runBillingIsolationTest();
      default:
        throw new Error(`未知のシナリオID: ${this.scenarioId}`);
    }
  }

  /**
   * 1. 正常系フロー (Normal Flow)
   */
  async runNormalFlow() {
    // Execution
    const execOut = MockExecutionKernel.execute({ files: ['app.js', 'render.js'], version: 'v1.0.0' });
    
    // Review
    const reviewOut = MockReviewKernel.execute(execOut);
    const v1 = ContractValidator.validate('Execution->Review', execOut.payload);
    if (!v1.success) return this.fail('MockReviewKernel', v1.error);

    // Quality
    const qualityOut = MockQualityKernel.execute(reviewOut);
    const v2 = ContractValidator.validate('Review->Quality', reviewOut.payload);
    if (!v2.success) return this.fail('MockQualityKernel', v2.error);

    // Learning
    const learningOut = MockLearningKernel.execute(qualityOut);
    const v3 = ContractValidator.validate('Quality->Learning', qualityOut.payload);
    if (!v3.success) return this.fail('MockLearningKernel', v3.error);

    // Governance
    const govOut = MockGovernanceKernel.execute({ payload: learningOut.payload, requiresApproval: false });

    await AuditWriter.write(this.simulationId, 'ContractValidated', {
      scenarioId: this.scenarioId,
      validationStatus: 'Passed'
    });

    return { status: 'Passed' };
  }

  /**
   * 2. 異常系・改善ループフロー (Error Flow)
   */
  async runErrorFlow() {
    // Execution (AI Smellのあるコードを含む)
    const execOut = MockExecutionKernel.execute({ files: ['smelly_code.js'], version: 'v1.0.0' });

    // Review (Smell検出)
    const reviewOut = MockReviewKernel.execute(execOut);
    
    // Quality (スコア不十分によるFAIL)
    const qualityOut = MockQualityKernel.execute(reviewOut);
    if (qualityOut.status === 'Failed') {
      // 早期終了、自己改善ループへ移行
      const selfReviewOut = MockSelfReviewKernel.execute(qualityOut);
      const improvementOut = MockSelfImprovementKernel.execute(selfReviewOut);
      
      await AuditWriter.write(this.simulationId, 'ExecutionFailed', {
        scenarioId: this.scenarioId,
        layerName: 'MockQualityKernel',
        errorMessage: '品質スコア不十分（FAIL）を模した早期終了改善ルート検証'
      });

      return {
        status: 'Failed',
        failedLayer: 'MockQualityKernel',
        error: { code: 'QUALITY_FAIL', message: '品質基準未充足による改善ルート移行' }
      };
    }

    return { status: 'Passed' };
  }

  /**
   * 3. ガバナンス・承認ゲートフロー (Approval Flow)
   */
  async runApprovalFlow() {
    // Optimization
    const optOut = MockOptimizationKernel.execute({ version: 'v1.0.0' });
    const v1 = ContractValidator.validate('Optimization->Governance', optOut.payload);
    if (!v1.success) return this.fail('MockGovernanceKernel', v1.error);

    // Governance (承認保留 Pending をシミュレート)
    const govOut = MockGovernanceKernel.execute({ payload: optOut.payload, requiresApproval: true });
    
    if (govOut.status === 'Pending') {
      // 監査に保留を記録
      await AuditWriter.write(this.simulationId, 'ContractValidated', {
        scenarioId: this.scenarioId,
        validationStatus: 'Pending',
        layerName: 'MockGovernanceKernel'
      });

      // 人間の模擬承認操作をメモリ上で解決
      const humanApprovalMock = true; // 模擬承認成立
      
      if (humanApprovalMock) {
        // 処理続行
        return { status: 'Passed' };
      }
    }

    return { status: 'Passed' };
  }

  /**
   * 4. 契約違反テスト (Contract Failure Test)
   */
  async runContractFailureTest() {
    // 必須フィールドを意図的に欠落させた Execution Output
    const badExecOut = {
      status: 'Success',
      payload: {
        // compiledFiles が欠落
        buildTimestamp: new Date().toISOString(),
        version: 'v1.0.0'
      }
    };

    // Review 接続点でコントラクトバリデーションを実行
    const v = ContractValidator.validate('Execution->Review', badExecOut.payload);
    if (!v.success) {
      return this.fail('MockReviewKernel', v.error);
    }

    return { status: 'Passed' };
  }

  /**
   * 5. 課金論理隔離テスト (Billing Isolation Test)
   */
  async runBillingIsolationTest() {
    // 模擬の支払い失敗Webhookイベントを受け取った状態をテスト
    const billingOut = MockBillingKernel.execute({
      triggerMockPaymentFailed: true,
      version: 'v1.0.0'
    });

    if (billingOut.status === 'Failed') {
      await AuditWriter.write(this.simulationId, 'ContractValidated', {
        scenarioId: this.scenarioId,
        layerName: 'MockBillingKernel',
        errorMessage: '課金モック決済失敗ルートの隔離稼働検証'
      });
      return {
        status: 'Failed',
        failedLayer: 'MockBillingKernel',
        error: billingOut.error
      };
    }

    return { status: 'Passed' };
  }

  /**
   * 異常終了時ヘルパー
   */
  fail(layerName, error) {
    return {
      status: 'Failed',
      failedLayer: layerName,
      error: error
    };
  }
}

module.exports = { ScenarioRunner };
