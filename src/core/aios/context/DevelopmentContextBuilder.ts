import * as crypto from 'crypto';
import { DevelopmentContext } from './DevelopmentContext';
import { DevelopmentContextType } from './DevelopmentContextType';
import { DevelopmentExecutionMode } from './DevelopmentExecutionMode';
import { DevelopmentContextStatus } from './DevelopmentContextStatus';

export class DevelopmentContextBuilder {
  private contextId: string = crypto.randomUUID();
  private contextVersion: string = '1.0.0';
  private contextType?: DevelopmentContextType;
  private status: DevelopmentContextStatus = DevelopmentContextStatus.CREATED;
  private executionMode: DevelopmentExecutionMode = DevelopmentExecutionMode.LOCAL;
  private targetPaths: string[] = [];
  private changedFiles: string[] = [];
  private project?: string;
  private pluginScope: string[] = [];
  private reviewerScope: string[] = [];
  private metadata: Record<string, unknown> = {};
  private createdAt: string = new Date().toISOString();

  public setContextId(id: string): this {
    this.contextId = id;
    return this;
  }

  public setContextVersion(version: string): this {
    this.contextVersion = version;
    return this;
  }

  public setContextType(type: DevelopmentContextType): this {
    this.contextType = type;
    return this;
  }

  public setStatus(status: DevelopmentContextStatus): this {
    this.status = status;
    return this;
  }

  public setExecutionMode(mode: DevelopmentExecutionMode): this {
    this.executionMode = mode;
    return this;
  }

  public setTargetPaths(paths: string[]): this {
    this.targetPaths = [...paths];
    return this;
  }

  public addTargetPath(path: string): this {
    this.targetPaths.push(path);
    return this;
  }

  public setChangedFiles(files: string[]): this {
    this.changedFiles = [...files];
    return this;
  }

  public addChangedFile(file: string): this {
    this.changedFiles.push(file);
    return this;
  }

  public setProject(project: string): this {
    this.project = project;
    return this;
  }

  public setPluginScope(scope: string[]): this {
    this.pluginScope = [...scope];
    return this;
  }

  public setReviewerScope(scope: string[]): this {
    this.reviewerScope = [...scope];
    return this;
  }

  public setMetadata(metadata: Record<string, unknown>): this {
    this.metadata = { ...metadata };
    return this;
  }

  public addMetadata(key: string, value: unknown): this {
    this.metadata[key] = value;
    return this;
  }

  public setCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  public build(): DevelopmentContext {
    if (!this.contextType) {
      throw new Error('contextType is required to build DevelopmentContext.');
    }
    if (!this.project) {
      throw new Error('project is required to build DevelopmentContext.');
    }

    const context: DevelopmentContext = {
      contextId: this.contextId,
      contextVersion: this.contextVersion,
      contextType: this.contextType,
      status: this.status,
      executionMode: this.executionMode,
      targetPaths: Object.freeze([...this.targetPaths]),
      changedFiles: Object.freeze([...this.changedFiles]),
      project: this.project,
      pluginScope: Object.freeze([...this.pluginScope]),
      reviewerScope: Object.freeze([...this.reviewerScope]),
      metadata: Object.freeze({ ...this.metadata }),
      createdAt: this.createdAt,
    };

    return Object.freeze(context);
  }
}
