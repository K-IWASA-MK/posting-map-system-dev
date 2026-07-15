import { DevelopmentContext } from '../context/DevelopmentContext';
import { ValidationArtifact } from '../validation/ValidationArtifact';
import { ValidationPipelineResult } from '../validation/ValidationPipelineResult';
import { DevelopmentPluginMetadata } from '../plugin/DevelopmentPluginMetadata';

export interface ReviewRequest {
  readonly context: DevelopmentContext;
  readonly validationArtifact: ValidationArtifact; // The latest artifact from the pipeline
  readonly pipelineResult: ValidationPipelineResult;
  readonly pluginMetadata: DevelopmentPluginMetadata;
  readonly instructions: string; // The core instructions (replaces prompt) for both AI and Human
  readonly metadata?: Readonly<Record<string, unknown>>;
}
