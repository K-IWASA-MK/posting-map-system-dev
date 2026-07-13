import { ValidationPlan } from '../models/ValidationPlan';
import { GraphBuilder } from './GraphBuilder';
import { GraphValidator } from './GraphValidator';
import { ExecutionOrderGenerator } from './ExecutionOrderGenerator';

export class ValidationPlanningService {
  constructor(
    private builder: GraphBuilder,
    private validator: GraphValidator,
    private orderGenerator: ExecutionOrderGenerator
  ) {}

  public createPlan(
    requiredValidators: string[], 
    dependencies: {from: string, to: string}[],
    targetPayload: any
  ): ValidationPlan {
    const graph = this.builder.build(requiredValidators, dependencies);
    this.validator.validate(graph);
    const order = this.orderGenerator.generate(graph);

    return {
      validationPlanId: `plan-${Date.now()}`,
      planVersion: '1.0.0',
      graphVersion: '1.0.0',
      validatorGraph: graph,
      dependencyGraph: dependencies,
      executionOrder: order,
      parallelGroup: [order], // Mock parallel group for foundation
      validatorCount: requiredValidators.length,
      estimatedDuration: requiredValidators.length * 10,
      requiredCapabilities: ['CAN_VALIDATE'],
      approvalTraceId: targetPayload.approvalTraceId || 'unknown',
      executionTraceId: targetPayload.executionTraceId || 'unknown',
      threshold: 80,
      expectedScore: 100,
      policy: { requireAllPassing: false, failFast: false, defaultTimeoutMs: 5000 },
      timeout: 30000,
      retryPolicy: { maxRetries: 3, backoffMultiplier: 2, initialBackoffMs: 100, retryableErrors: ['TimeoutError'] }
    };
  }
}
