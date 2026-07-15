import { KnowledgeOSState } from './KnowledgeOSState';
import { IKnowledgeRepository } from '../repository/IKnowledgeRepository';
import { KnowledgeRegistry } from '../engine/KnowledgeRegistry';
import { KnowledgeGovernanceRegistry } from '../governance/KnowledgeGovernanceRegistry';
import { KnowledgeRuleRegistry } from '../governance/KnowledgeRuleRegistry';
import { KnowledgeVersion } from './KnowledgeVersion';

export interface KnowledgeHealth {
  readonly status: KnowledgeOSState;
  readonly knowledgeCount: number;
  readonly policyCount: number;
  readonly ruleCount: number;
  readonly pluginCount: number;
  readonly repositoryType: string;
}

export interface KnowledgeDiagnostics {
  readonly status: KnowledgeOSState;
  readonly coreVersion: string;
  readonly schemaVersion: string;
  readonly sprint: string;
  readonly build: string;
  readonly registryPlugins: ReadonlyArray<string>;
  readonly registryPolicies: ReadonlyArray<string>;
  readonly registryRules: ReadonlyArray<string>;
}

export class KnowledgeRuntime {
  private _state = KnowledgeOSState.BOOTING;
  private _errorMessage?: string;

  constructor(
    private readonly repository: IKnowledgeRepository,
    private readonly pluginRegistry: KnowledgeRegistry,
    private readonly govRegistry: KnowledgeGovernanceRegistry,
    private readonly ruleRegistry: KnowledgeRuleRegistry,
    private readonly versionInfo: KnowledgeVersion
  ) {}

  public get state(): KnowledgeOSState {
    return this._state;
  }

  public get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  public transitionTo(state: KnowledgeOSState, errorMessage?: string): void {
    this._state = state;
    if (errorMessage) {
      this._errorMessage = errorMessage;
    }
  }

  public async health(): Promise<KnowledgeHealth> {
    const knowledgeCount = await this.repository.count();
    const policyCount = this.govRegistry.count();
    const ruleCount = this.ruleRegistry.count();
    const pluginCount = this.pluginRegistry.count();

    return Object.freeze({
      status: this._state,
      knowledgeCount,
      policyCount,
      ruleCount,
      pluginCount,
      repositoryType: 'IN_MEMORY'
    });
  }

  public async diagnostics(): Promise<KnowledgeDiagnostics> {
    const plugins = this.pluginRegistry.listIds();
    const rules = this.ruleRegistry.listIds();
    const policies = this.govRegistry.listPolicyIds();

    return Object.freeze({
      status: this._state,
      coreVersion: this.versionInfo.coreVersion,
      schemaVersion: this.versionInfo.schemaVersion,
      sprint: this.versionInfo.sprint,
      build: this.versionInfo.build,
      registryPlugins: Object.freeze(plugins),
      registryPolicies: Object.freeze(policies),
      registryRules: Object.freeze(rules)
    });
  }
}
