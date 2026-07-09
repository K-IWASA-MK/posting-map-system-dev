/**
 * DevelopmentRules.ts
 * 
 * Development OS で適用される各開発ルールの定義体。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

import { CapabilityRegistry } from './CapabilityRegistry';
import { SkillRegistry, Skill } from './SkillRegistry';
import { SkillPipelineRegistry, SkillPipeline } from './SkillPipelineRegistry';
import { ExecutionLedgerRegistry, ExecutionRecord } from './ExecutionLedgerRegistry';
import { QualityGateRegistry, QualityGateRecord } from './QualityGateRegistry';
import { ToolAdapterRegistry, ToolAdapter } from './ToolAdapter';
import { AntigravityAdapterRegistry, AntigravityAdapter } from './AntigravityAdapter';
import { ClaudeAdapterRegistry, ClaudeAdapter } from './ClaudeAdapter';
import { ClaudeModelRegistry, ClaudeModel } from './ClaudeModelRegistry';
import { GeminiAdapterRegistry, GeminiAdapter } from './GeminiAdapter';
import { GeminiModelRegistry, GeminiModel } from './GeminiModelRegistry';
import { OpenAIAdapterRegistry, OpenAIAdapter } from './OpenAIAdapter';
import { OpenAIModelRegistry, OpenAIModel } from './OpenAIModelRegistry';
import { AdapterResolver } from './AdapterResolver';
import { MultiAdapterRegistry } from './MultiAdapterRegistry';
import { AdapterType } from './AdapterResolutionRegistry';
import { RuntimeRegistry, RuntimeRecord } from './RuntimeRegistry';
import { RuntimeSessionRegistry, Session } from './RuntimeSessionRegistry';
import { RuntimeContextRegistry, Context } from './RuntimeContextRegistry';
import { RuntimeQueueRegistry, Queue } from './RuntimeQueueRegistry';
import { RuntimeTaskRegistry, Task } from './RuntimeTaskRegistry';
import { RuntimeExecutionPlanRegistry, ExecutionPlan } from './RuntimeExecutionPlanRegistry';
import { RuntimeExecutionGraphRegistry, ExecutionGraph } from './RuntimeExecutionGraphRegistry';
import { ExecutionEngine, EXECUTION_ENGINE_BLUEPRINT } from '../execution/ExecutionEngine';
import { ExecutionRegistry, EXECUTION_REGISTRY_BLUEPRINT } from '../execution/ExecutionRegistry';
import { ExecutionRequest, EXECUTION_REQUEST_BLUEPRINT } from '../execution/ExecutionRequest';
import { ExecutionResult, EXECUTION_RESULT_BLUEPRINT } from '../execution/ExecutionResult';
import { ExecutionState, EXECUTION_STATE_BLUEPRINT } from '../execution/ExecutionState';
import { ExecutionResolver, EXECUTION_RESOLVER_BLUEPRINT } from '../execution/ExecutionResolver';
import { ExecutionDispatcher, EXECUTION_DISPATCHER_BLUEPRINT } from '../execution/ExecutionDispatcher';
import { ExecutionRuntime, EXECUTION_RUNTIME_BLUEPRINT } from '../execution/ExecutionRuntime';
import { ExecutionRuntimeRegistry, EXECUTION_RUNTIME_REGISTRY_BLUEPRINT } from '../execution/ExecutionRuntimeRegistry';

export interface DevelopmentRule {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly capability: string;
  readonly priority: number;
}

export class DevelopmentRules {
  /**
   * 不変な開発ルールオブジェクトを生成する
   */
  static createRule(id: string, name: string, capability: string, priority: number): DevelopmentRule {
    if (!id) {
      throw new Error('[DevelopmentRules] ruleId is required');
    }
    if (!name) {
      throw new Error('[DevelopmentRules] ruleName is required');
    }
    if (!capability) {
      throw new Error('[DevelopmentRules] capability is required');
    }

    // Capability がレジストリに存在するか検証 (Name または ID)
    const verified = CapabilityRegistry.get(capability) || CapabilityRegistry.getByName(capability);
    if (!verified) {
      throw new Error(`[DevelopmentRules] Capability is not registered: ${capability}`);
    }

    const rule: DevelopmentRule = {
      ruleId: id,
      ruleName: name,
      capability: capability,
      priority: priority
    };

    return Object.freeze(rule);
  }

  /**
   * ルールに関連付けられた Capability を満たすための全 Skill を SkillRegistry から取得する
   */
  static getRequiredSkills(rule: DevelopmentRule): Skill[] {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return [];
    }
    return SkillRegistry.getByCapability(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability を実行するための SkillPipeline を SkillPipelineRegistry から取得する
   */
  static getRequiredPipeline(rule: DevelopmentRule): SkillPipeline | undefined {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return undefined;
    }
    return SkillPipelineRegistry.getByCapability(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability に対応する ExecutionRecord 履歴を ExecutionLedgerRegistry から取得する
   */
  static getExecutionLedger(rule: DevelopmentRule): ExecutionRecord[] {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return [];
    }
    return ExecutionLedgerRegistry.getByCapability(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability の最新の QualityGateRecord を取得する
   */
  static getQualityGate(rule: DevelopmentRule): QualityGateRecord | undefined {
    const ledgers = this.getExecutionLedger(rule);
    if (ledgers.length === 0) {
      return undefined;
    }
    // 最新の Ledger に対応する QualityGateRecord を取得
    const latestLedger = ledgers[ledgers.length - 1];
    return QualityGateRegistry.getByLedger(latestLedger.executionId);
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 ToolAdapter を取得する
   */
  static getToolAdapters(rule: DevelopmentRule): ToolAdapter[] {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return [];
    }
    return ToolAdapterRegistry.getByPipeline(pipeline.pipelineId);
  }

  /**
   * ルールに関連付けられた Capability をサポートする AntigravityAdapter を取得する
   */
  static getAntigravityAdapter(rule: DevelopmentRule): AntigravityAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = AntigravityAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする ClaudeAdapter を取得する
   */
  static getClaudeAdapter(rule: DevelopmentRule): ClaudeAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = ClaudeAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 ClaudeModel を取得する (4層解決)
   */
  static getClaudeModels(rule: DevelopmentRule): ClaudeModel[] {
    const adapter = this.getClaudeAdapter(rule);
    if (!adapter) {
      return [];
    }
    const models: ClaudeModel[] = [];
    for (const modelId of adapter.supportedModelIds) {
      const m = ClaudeModelRegistry.get(modelId);
      if (m) {
        models.push(m);
      }
    }
    return models;
  }

  /**
   * ルールに関連付けられた Capability をサポートする GeminiAdapter を取得する
   */
  static getGeminiAdapter(rule: DevelopmentRule): GeminiAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = GeminiAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 GeminiModel を取得する (4層解決)
   */
  static getGeminiModels(rule: DevelopmentRule): GeminiModel[] {
    const adapter = this.getGeminiAdapter(rule);
    if (!adapter) {
      return [];
    }
    const models: GeminiModel[] = [];
    for (const modelId of adapter.supportedModelIds) {
      const m = GeminiModelRegistry.get(modelId);
      if (m) {
        models.push(m);
      }
    }
    return models;
  }

  /**
   * ルールに関連付けられた Capability をサポートする OpenAIAdapter を取得する
   */
  static getOpenAIAdapter(rule: DevelopmentRule): OpenAIAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = OpenAIAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 OpenAIModel を取得する (4層解決)
   */
  static getOpenAIModels(rule: DevelopmentRule): OpenAIModel[] {
    const adapter = this.getOpenAIAdapter(rule);
    if (!adapter) {
      return [];
    }
    const models: OpenAIModel[] = [];
    for (const modelId of adapter.supportedModelIds) {
      const m = OpenAIModelRegistry.get(modelId);
      if (m) {
        models.push(m);
      }
    }
    return models;
  }

  /**
   * ルールに関連付けられた Capability に対する最適な ToolAdapter を AdapterResolver を介して自動解決・取得する
   */
  static getResolvedAdapter(rule: DevelopmentRule): ToolAdapter | undefined {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return undefined;
    }
    return AdapterResolver.resolve(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability に対するすべての利用可能アダプター一覧を取得する
   */
  static getAvailableAdapters(rule: DevelopmentRule): readonly ToolAdapter[] {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return [];
    }
    
    // MultiAdapterRegistry から該当 Capability をサポートするレコードを取得
    const records = MultiAdapterRegistry.findByCapability(verified.capabilityId);
    const list: ToolAdapter[] = [];
    
    for (const rec of records) {
      let adapter: ToolAdapter | undefined;
      switch (rec.adapterType) {
        case AdapterType.ANTIGRAVITY:
          adapter = AntigravityAdapterRegistry.get(rec.adapterId);
          break;
        case AdapterType.CLAUDE:
          adapter = ClaudeAdapterRegistry.get(rec.adapterId);
          break;
        case AdapterType.GEMINI:
          adapter = GeminiAdapterRegistry.get(rec.adapterId);
          break;
        case AdapterType.OPENAI:
          adapter = OpenAIAdapterRegistry.get(rec.adapterId);
          break;
      }
      if (adapter) {
        list.push(adapter);
      }
    }
    
    return Object.freeze(list);
  }

  /**
   * ルールに関連付けられた Capability から Pipeline を経由して RuntimeRecord を静的に解決・取得する
   */
  static getRuntime(rule: DevelopmentRule): RuntimeRecord | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const match = pipeline.pipelineId.match(/\d+/);
    if (!match) {
      return undefined;
    }
    return RuntimeRegistry.get(`runtime-${match[0]}`);
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime から RuntimeSession を静的に解決・取得する
   */
  static getRuntimeSession(rule: DevelopmentRule): Session | undefined {
    const runtime = this.getRuntime(rule);
    if (!runtime) {
      return undefined;
    }
    const sessions = RuntimeSessionRegistry.findByRuntime(runtime.runtimeId);
    return sessions.length > 0 ? sessions[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession から RuntimeContext を静的に解決・取得する
   */
  static getRuntimeContext(rule: DevelopmentRule): Context | undefined {
    const session = this.getRuntimeSession(rule);
    if (!session) {
      return undefined;
    }
    const contexts = RuntimeContextRegistry.findBySession(session.sessionId);
    return contexts.length > 0 ? contexts[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext から RuntimeQueue を静的に解決・取得する
   */
  static getRuntimeQueue(rule: DevelopmentRule): Queue | undefined {
    const context = this.getRuntimeContext(rule);
    if (!context) {
      return undefined;
    }
    const queues = RuntimeQueueRegistry.findByContext(context.contextId);
    return queues.length > 0 ? queues[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue から RuntimeTask を静的に解決・取得する
   */
  static getRuntimeTask(rule: DevelopmentRule): Task | undefined {
    const queue = this.getRuntimeQueue(rule);
    if (!queue) {
      return undefined;
    }
    const tasks = RuntimeTaskRegistry.findByQueue(queue.queueId);
    return tasks.length > 0 ? tasks[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask から RuntimeExecutionPlan を静的に解決・取得する
   */
  static getRuntimeExecutionPlan(rule: DevelopmentRule): ExecutionPlan | undefined {
    const task = this.getRuntimeTask(rule);
    if (!task) {
      return undefined;
    }
    const plans = RuntimeExecutionPlanRegistry.findByTask(task.taskId);
    return plans.length > 0 ? plans[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan から RuntimeExecutionGraph を静的に解決・取得する
   */
  static getRuntimeExecutionGraph(rule: DevelopmentRule): ExecutionGraph | undefined {
    const plan = this.getRuntimeExecutionPlan(rule);
    if (!plan) {
      return undefined;
    }
    const graphs = RuntimeExecutionGraphRegistry.findByPlan(plan.planId);
    return graphs.length > 0 ? graphs[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph から ExecutionEngine を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionEngine(rule: DevelopmentRule): ExecutionEngine | undefined {
    const graph = this.getRuntimeExecutionGraph(rule);
    if (!graph) {
      return undefined;
    }
    // ExecutionEngine はトポロジー層の下位に静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_ENGINE_BLUEPRINT.getBlueprint();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine から ExecutionRegistry を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionRegistry(rule: DevelopmentRule): ExecutionRegistry | undefined {
    const engine = this.getExecutionEngine(rule);
    if (!engine) {
      return undefined;
    }
    // ExecutionRegistry は静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_REGISTRY_BLUEPRINT.getRegistry();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine -> ExecutionRegistry から ExecutionRequest を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionRequest(rule: DevelopmentRule): ExecutionRequest | undefined {
    const registry = this.getExecutionRegistry(rule);
    if (!registry) {
      return undefined;
    }
    // ExecutionRequest は静的配置された単一 of Blueprint として不変で解決される
    return EXECUTION_REQUEST_BLUEPRINT.getRequest();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine -> ExecutionRegistry -> ExecutionRequest から ExecutionResult を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionResult(rule: DevelopmentRule): ExecutionResult | undefined {
    const request = this.getExecutionRequest(rule);
    if (!request) {
      return undefined;
    }
    // ExecutionResult は静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_RESULT_BLUEPRINT.getResult();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine -> ExecutionRegistry -> ExecutionRequest -> ExecutionResult から ExecutionState を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionState(rule: DevelopmentRule): ExecutionState | undefined {
    const result = this.getExecutionResult(rule);
    if (!result) {
      return undefined;
    }
    // ExecutionState は静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_STATE_BLUEPRINT.getState();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine -> ExecutionRegistry -> ExecutionRequest -> ExecutionResult -> ExecutionState から ExecutionResolver を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionResolver(rule: DevelopmentRule): ExecutionResolver | undefined {
    const state = this.getExecutionState(rule);
    if (!state) {
      return undefined;
    }
    // ExecutionResolver は静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_RESOLVER_BLUEPRINT.getResolver();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine -> ExecutionRegistry -> ExecutionRequest -> ExecutionResult -> ExecutionState -> ExecutionResolver から ExecutionDispatcher を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionDispatcher(rule: DevelopmentRule): ExecutionDispatcher | undefined {
    const resolver = this.getExecutionResolver(rule);
    if (!resolver) {
      return undefined;
    }
    // ExecutionDispatcher は静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_DISPATCHER_BLUEPRINT.getDispatcher();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine -> ExecutionRegistry -> ExecutionRequest -> ExecutionResult -> ExecutionState -> ExecutionResolver -> ExecutionDispatcher -> ExecutionRuntime から ExecutionRuntime を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーンの延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionRuntime(rule: DevelopmentRule): ExecutionRuntime | undefined {
    const dispatcher = this.getExecutionDispatcher(rule);
    if (!dispatcher) {
      return undefined;
    }
    // ExecutionRuntime はトポロジー層の下位に静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_RUNTIME_BLUEPRINT.getRuntime();
  }

  /**
   * ルールに関連付けられた Capability -> Pipeline -> Runtime -> RuntimeSession -> RuntimeContext -> RuntimeQueue -> RuntimeTask -> RuntimeExecutionPlan -> RuntimeExecutionGraph -> ExecutionEngine -> ExecutionRegistry -> ExecutionRequest -> ExecutionResult -> ExecutionState -> ExecutionResolver -> ExecutionDispatcher -> ExecutionRuntime -> ExecutionRuntimeRegistry から ExecutionRuntimeRegistry を解決する。
   * 
   * 注意：このメソッドは完全静的解決（Static Mapping）のみを実行し、Runtime Logic, Lazy Resolution, Dynamic Search 等は一切実装せず、静的トポロジー解決チェーン of 延長線上にある不変の静的マッピングのみを返します。
   */
  static getExecutionRuntimeRegistry(rule: DevelopmentRule): ExecutionRuntimeRegistry | undefined {
    const runtime = this.getExecutionRuntime(rule);
    if (!runtime) {
      return undefined;
    }
    // ExecutionRuntimeRegistry はトポロジー層の下位に静的配置された単一の Blueprint として不変で解決される
    return EXECUTION_RUNTIME_REGISTRY_BLUEPRINT.getRegistry();
  }
}
