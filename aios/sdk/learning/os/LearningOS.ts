import { ILearningOS } from './ILearningOS';
import { LearningOSHealth } from './LearningOSHealth';
import { LearningVersion } from './LearningVersion';
import { ILearningPipeline, LearningPipelineResult } from '../pipeline';
import { IPatternQueryService, PatternQueryRequest, PatternQueryResult } from '../query';
import { LearningRuntime } from './LearningRuntime';
import { LearningOSComponents } from './LearningFactory';
import { LearningOSState } from './LearningOSState';
import { LearningRequest, PatternType, LearningPattern } from '../contracts';

export class LearningOS implements ILearningOS {
  constructor(
    private readonly runtime: LearningRuntime,
    private readonly components: LearningOSComponents,
    private readonly _version: LearningVersion
  ) {}

  public async initialize(): Promise<void> {
    // OS is already booted by Bootstrap. This is for any delayed initialization if needed.
    if (this.runtime.state === LearningOSState.SHUTDOWN) {
      throw new Error("Cannot initialize a SHUTDOWN OS.");
    }
  }

  public async shutdown(): Promise<void> {
    this.runtime.transitionTo(LearningOSState.SHUTDOWN);
  }

  public health(): LearningOSHealth {
    return Object.freeze({
      state: this.runtime.state,
      uptimeMs: this.runtime.uptimeMs,
      loadedPlugins: this.components.loadedPluginsCount,
      loadedPolicies: this.components.loadedPoliciesCount,
      version: this._version,
      lastError: this.runtime.lastError
    });
  }

  public version(): LearningVersion {
    return this._version;
  }

  public pipeline(): ILearningPipeline {
    const osRuntime = this.runtime;
    const innerPipeline = this.components.pipeline;
    
    // Wrap the pipeline to enforce state transitions
    return {
      run: async (request: LearningRequest): Promise<LearningPipelineResult> => {
        return osRuntime.runSafely(() => innerPipeline.run(request));
      }
    };
  }

  public query(): IPatternQueryService {
    const osRuntime = this.runtime;
    const innerQuery = this.components.queryService;

    const assertNotShutdown = () => {
      if (osRuntime.state === LearningOSState.SHUTDOWN || osRuntime.state === LearningOSState.ERROR) {
        throw new Error(`Cannot execute query. OS State: ${osRuntime.state}`);
      }
    };

    return {
      query: async (request: PatternQueryRequest): Promise<PatternQueryResult> => {
        assertNotShutdown();
        return innerQuery.query(request);
      },
      findById: async (patternId: string): Promise<ReadonlyArray<LearningPattern>> => {
        assertNotShutdown();
        return innerQuery.findById(patternId);
      },
      findByType: async (patternType: PatternType): Promise<ReadonlyArray<LearningPattern>> => {
        assertNotShutdown();
        return innerQuery.findByType(patternType);
      },
      findLatestVersion: async (patternId: string): Promise<LearningPattern | undefined> => {
        assertNotShutdown();
        return innerQuery.findLatestVersion(patternId);
      },
      findAll: async (): Promise<ReadonlyArray<LearningPattern>> => {
        assertNotShutdown();
        return innerQuery.findAll();
      }
    };
  }
}
