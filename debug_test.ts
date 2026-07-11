import { DevelopmentRules } from './src/aios/DevelopmentRules';
import { CapabilityRegistry } from './src/aios/CapabilityRegistry';

const rule = {
  ruleId: 'rule-1', ruleName: 'test',
  capability: 'Testing',
  description: 'Rule testing',
  priority: 10,
  isActive: true,
  createdAt: new Date()
};

CapabilityRegistry.clear();

const interpreter = DevelopmentRules.getExecutionRuntimeBlueprintInterpreter(rule);
console.log("Interpreter:", !!interpreter);
const executor = DevelopmentRules.getExecutionRuntimeExecutor(rule);
console.log("Executor:", !!executor);
const composer = DevelopmentRules.getExecutionRuntimeComposer(rule);
console.log("Composer:", !!composer);
const builder = DevelopmentRules.getExecutionRuntimeBuilder(rule);
console.log("Builder:", !!builder);
const loader = DevelopmentRules.getExecutionRuntimeLoader(rule);
console.log("Loader:", !!loader);
const instance = DevelopmentRules.getExecutionRuntimeInstance(rule);
console.log("Instance:", !!instance);
const session = DevelopmentRules.getExecutionRuntimeSessionManager(rule);
console.log("Session:", !!session);
const state = DevelopmentRules.getExecutionRuntimeStateManager(rule);
console.log("State:", !!state);
const context = DevelopmentRules.getExecutionRuntimeContextManager(rule);
console.log("Context:", !!context);
const pipeline = DevelopmentRules.getExecutionRuntimePipeline(rule);
console.log("Pipeline:", !!pipeline);
const orchestrator = DevelopmentRules.getExecutionRuntimeOrchestrator(rule);
console.log("Orchestrator:", !!orchestrator);
const boot = DevelopmentRules.getExecutionRuntimeBoot(rule);
console.log("Boot:", !!boot);
const executorLifecycle = DevelopmentRules.getExecutionRuntimeComponentLifecycleExecutor(rule);
console.log("LifecycleExecutor:", !!executorLifecycle);

