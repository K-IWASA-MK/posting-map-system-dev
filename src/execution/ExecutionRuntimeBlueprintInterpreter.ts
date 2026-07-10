/**
 * ExecutionRuntimeBlueprintInterpreter.ts
 * 
 * Blueprint Interpreter Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際の Blueprint 解釈、パース、分析、コンパイル、実行、
 * 実行時インスタンス生成、依存解決、Runtime Context 更新、Runtime State/Session 保持、
 * 非同期処理、キュー処理、リトライ、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum BlueprintInterpreterType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME',
  SIMULATION = 'SIMULATION',
  PLUGIN = 'PLUGIN',
  AI = 'AI'
}

export enum BlueprintInterpreterScope {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  TENANT = 'TENANT'
}

export enum RuntimeInterpretationType {
  BOOT_BLUEPRINT = 'BOOT_BLUEPRINT',
  ENGINE_BLUEPRINT = 'ENGINE_BLUEPRINT',
  SERVICE_BLUEPRINT = 'SERVICE_BLUEPRINT',
  COMPONENT_BLUEPRINT = 'COMPONENT_BLUEPRINT',
  APPLICATION_BLUEPRINT = 'APPLICATION_BLUEPRINT'
}

export enum InterpretationStep {
  REGISTER_BLUEPRINT = 'REGISTER_BLUEPRINT',
  VALIDATE_SCHEMA = 'VALIDATE_SCHEMA',
  BUILD_INTERPRETATION_SCHEMA = 'BUILD_INTERPRETATION_SCHEMA',
  READY_FOR_KERNEL = 'READY_FOR_KERNEL',
  INTERPRETATION_SCHEMA_READY = 'INTERPRETATION_SCHEMA_READY'
}

export enum InterpretationPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE = 'IMMUTABLE',
  SCHEMA_ONLY = 'SCHEMA_ONLY',
  NO_RUNTIME_STATE = 'NO_RUNTIME_STATE'
}

export interface RuntimeInterpretationModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly interpretationModelVersion: string;
  readonly blueprintSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeInterpretationModel {
  readonly interpretationType: RuntimeInterpretationType;
  readonly modelId: string;
  readonly metadata: RuntimeInterpretationModelMetadata;
  readonly interpretationOrder: number;
  readonly targetBlueprints: readonly string[];
  readonly supportedBlueprintTypes: readonly string[];
  readonly interpretationPolicy: readonly InterpretationPolicy[];
  readonly allowedSteps: readonly InterpretationStep[];
}

export interface BlueprintInterpreterMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeBlueprintInterpreterContext {
  readonly runtimeBlueprintInterpreterId: string;
}

export interface ExecutionRuntimeBlueprintInterpreterData {
  readonly managerType: BlueprintInterpreterType;
  readonly managerScope: BlueprintInterpreterScope;
  readonly interpretationModels: readonly RuntimeInterpretationModel[];
}

export interface ExecutionRuntimeBlueprintInterpreter {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeBlueprintInterpreterContext;
  readonly metadata: BlueprintInterpreterMetadata;
  readonly data: ExecutionRuntimeBlueprintInterpreterData;
}

export interface ExecutionRuntimeBlueprintInterpreterBlueprint {
  getExecutionRuntimeBlueprintInterpreter(): ExecutionRuntimeBlueprintInterpreter;
  getMetadata(): BlueprintInterpreterMetadata;
  getContext(): ExecutionRuntimeBlueprintInterpreterContext;
  getData(): ExecutionRuntimeBlueprintInterpreterData;
  getInterpretationModels(): readonly RuntimeInterpretationModel[];
  getInterpretationSequence(): readonly InterpretationStep[];
}

// 1. 静的解釈手順リストの定義と凍結 (INTERPRETATION_SCHEMA_READY を含む)
export const INTERPRETATION_SEQUENCE: readonly InterpretationStep[] = Object.freeze([
  InterpretationStep.REGISTER_BLUEPRINT,
  InterpretationStep.VALIDATE_SCHEMA,
  InterpretationStep.BUILD_INTERPRETATION_SCHEMA,
  InterpretationStep.READY_FOR_KERNEL,
  InterpretationStep.INTERPRETATION_SCHEMA_READY
]);

// 解釈ポリシーの定義と凍結
const defaultPolicies: readonly InterpretationPolicy[] = Object.freeze([
  InterpretationPolicy.READ_ONLY,
  InterpretationPolicy.DETERMINISTIC,
  InterpretationPolicy.IMMUTABLE,
  InterpretationPolicy.SCHEMA_ONLY,
  InterpretationPolicy.NO_RUNTIME_STATE
]);

// サポートされている Blueprint タイプの一覧定義
const supportedTypes: readonly string[] = Object.freeze([
  'BOOT',
  'ENGINE',
  'SERVICE',
  'COMPONENT',
  'APPLICATION'
]);

// 2. 静的解釈モデルリストの定義と凍結 (interpretationModelVersion 1.0, blueprintSchemaVersion 1.0, interpretationOrder 1〜5, targetBlueprints, supportedBlueprintTypes, interpretationPolicy を含む)
export const RUNTIME_INTERPRETATION_MODELS: readonly RuntimeInterpretationModel[] = Object.freeze([
  Object.freeze({
    interpretationType: RuntimeInterpretationType.BOOT_BLUEPRINT,
    modelId: 'interpretation-model-boot-01',
    metadata: Object.freeze({
      id: 'interpretation-model-meta-boot-01',
      name: 'Boot Interpretation Model Metadata',
      interpretationModelVersion: '1.0',
      blueprintSchemaVersion: '1.0',
      description: 'Metadata for Boot Interpretation Model Schema'
    }),
    interpretationOrder: 1,
    targetBlueprints: Object.freeze(['boot-blueprint-id']),
    supportedBlueprintTypes: supportedTypes,
    interpretationPolicy: defaultPolicies,
    allowedSteps: INTERPRETATION_SEQUENCE
  }),
  Object.freeze({
    interpretationType: RuntimeInterpretationType.ENGINE_BLUEPRINT,
    modelId: 'interpretation-model-engine-01',
    metadata: Object.freeze({
      id: 'interpretation-model-meta-engine-01',
      name: 'Engine Interpretation Model Metadata',
      interpretationModelVersion: '1.0',
      blueprintSchemaVersion: '1.0',
      description: 'Metadata for Engine Interpretation Model Schema'
    }),
    interpretationOrder: 2,
    targetBlueprints: Object.freeze(['engine-blueprint-id']),
    supportedBlueprintTypes: supportedTypes,
    interpretationPolicy: defaultPolicies,
    allowedSteps: INTERPRETATION_SEQUENCE
  }),
  Object.freeze({
    interpretationType: RuntimeInterpretationType.SERVICE_BLUEPRINT,
    modelId: 'interpretation-model-service-01',
    metadata: Object.freeze({
      id: 'interpretation-model-meta-service-01',
      name: 'Service Interpretation Model Metadata',
      interpretationModelVersion: '1.0',
      blueprintSchemaVersion: '1.0',
      description: 'Metadata for Service Interpretation Model Schema'
    }),
    interpretationOrder: 3,
    targetBlueprints: Object.freeze(['service-blueprint-id']),
    supportedBlueprintTypes: supportedTypes,
    interpretationPolicy: defaultPolicies,
    allowedSteps: INTERPRETATION_SEQUENCE
  }),
  Object.freeze({
    interpretationType: RuntimeInterpretationType.COMPONENT_BLUEPRINT,
    modelId: 'interpretation-model-component-01',
    metadata: Object.freeze({
      id: 'interpretation-model-meta-component-01',
      name: 'Component Interpretation Model Metadata',
      interpretationModelVersion: '1.0',
      blueprintSchemaVersion: '1.0',
      description: 'Metadata for Component Interpretation Model Schema'
    }),
    interpretationOrder: 4,
    targetBlueprints: Object.freeze(['component-blueprint-id']),
    supportedBlueprintTypes: supportedTypes,
    interpretationPolicy: defaultPolicies,
    allowedSteps: INTERPRETATION_SEQUENCE
  }),
  Object.freeze({
    interpretationType: RuntimeInterpretationType.APPLICATION_BLUEPRINT,
    modelId: 'interpretation-model-app-01',
    metadata: Object.freeze({
      id: 'interpretation-model-meta-app-01',
      name: 'Application Interpretation Model Metadata',
      interpretationModelVersion: '1.0',
      blueprintSchemaVersion: '1.0',
      description: 'Metadata for Application Interpretation Model Schema'
    }),
    interpretationOrder: 5,
    targetBlueprints: Object.freeze(['application-blueprint-id']),
    supportedBlueprintTypes: supportedTypes,
    interpretationPolicy: defaultPolicies,
    allowedSteps: INTERPRETATION_SEQUENCE
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const managerMetadata: BlueprintInterpreterMetadata = Object.freeze({
  id: 'runtime-blueprint-interpreter-manager-meta-01',
  name: 'Execution Runtime Blueprint Interpreter Manager Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Blueprint Interpreter Manager Foundation',
  layer: 'Blueprint Interpreter Manager Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeBlueprintInterpreterId のみ)
const managerContext: ExecutionRuntimeBlueprintInterpreterContext = Object.freeze({
  runtimeBlueprintInterpreterId: 'runtime-blueprint-interpreter-01'
});

// 5. データオブジェクトの作成と凍結
const managerData: ExecutionRuntimeBlueprintInterpreterData = Object.freeze({
  managerType: BlueprintInterpreterType.FOUNDATION,
  managerScope: BlueprintInterpreterScope.SYSTEM,
  interpretationModels: RUNTIME_INTERPRETATION_MODELS
});

// 6. インタプリタマネージャーオブジェクト本体の作成と凍結
const runtimeBlueprintInterpreterData: ExecutionRuntimeBlueprintInterpreter = Object.freeze({
  id: 'runtime-blueprint-interpreter-01',
  name: 'Default Execution Runtime Blueprint Interpreter Foundation',
  description: 'The static execution runtime blueprint interpreter manager structure definition',
  context: managerContext,
  metadata: managerMetadata,
  data: managerData
});

// Blueprint コンテナの不変シングルトンインスタンス実装
export const EXECUTION_RUNTIME_BLUEPRINT_INTERPRETER_BLUEPRINT: ExecutionRuntimeBlueprintInterpreterBlueprint = Object.freeze({
  getExecutionRuntimeBlueprintInterpreter(): ExecutionRuntimeBlueprintInterpreter {
    return runtimeBlueprintInterpreterData;
  },

  getMetadata(): BlueprintInterpreterMetadata {
    return runtimeBlueprintInterpreterData.metadata;
  },

  getContext(): ExecutionRuntimeBlueprintInterpreterContext {
    return runtimeBlueprintInterpreterData.context;
  },

  getData(): ExecutionRuntimeBlueprintInterpreterData {
    return runtimeBlueprintInterpreterData.data;
  },

  getInterpretationModels(): readonly RuntimeInterpretationModel[] {
    return RUNTIME_INTERPRETATION_MODELS;
  },

  getInterpretationSequence(): readonly InterpretationStep[] {
    return INTERPRETATION_SEQUENCE;
  }
});
