import { ITestExecutionStrategy, StrategyCapabilities } from '../ITestExecutionStrategy';
import { StrategyExecutionResult } from '../StrategyExecutionResult';
import { ExecutionPlan } from '../ExecutionPlan';
import { spawnSync } from 'child_process';

/**
 * SequentialExecutionStrategy executes test files one-by-one in fresh Node.js processes.
 */
export class SequentialExecutionStrategy implements ITestExecutionStrategy {
  public readonly name = 'Sequential';
  public readonly capabilities: StrategyCapabilities = {
    supportsIsolation: true,
    supportsParallel: false,
    supportsCompilationCache: false,
    supportsDeterministicExecution: true
  };

  public async execute(plan: ExecutionPlan): Promise<StrategyExecutionResult> {
    const startTime = Date.now();
    let passedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    let totalSpawnTime = 0;

    for (const entry of plan.entries) {
      const file = entry.asset.module;
      const spawnStart = Date.now();
      const result = spawnSync('npx', ['ts-node', '-r', 'tsconfig-paths/register', file], {
        encoding: 'utf-8',
        stdio: 'inherit'
      });
      totalSpawnTime += (Date.now() - spawnStart);

      if (result.status === 0) {
        passedCount++;
      } else {
        failedCount++;
        errors.push(`TypeScript test file failed: ${file} (Exit code: ${result.status})`);
      }
    }

    const totalTime = Date.now() - startTime;

    return {
      success: failedCount === 0,
      passedCount,
      failedCount,
      errors,
      metrics: {
        totalTime,
        startupTime: Math.round(totalSpawnTime * 0.15), // Est. 15% startup
        compileTime: Math.round(totalSpawnTime * 0.70), // Est. 70% compiler
        executionTime: Math.round(totalSpawnTime * 0.15) // Est. 15% execution
      }
    };
  }
}
