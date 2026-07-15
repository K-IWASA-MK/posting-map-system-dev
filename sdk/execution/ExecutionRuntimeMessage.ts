/**
 * ExecutionRuntimeMessage.ts
 * 
 * Execution Runtime Message Foundation の構造および公開インターフェース定義 (SSOT)。
 * 
 * 警告：本ファイル内への実際のメッセージ生成、送信、受信、解析、ルーティング、返信、
 * 同期、配信、非同期処理、API 通信、コマンド送信、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum MessageType {
  FOUNDATION = 'FOUNDATION',
  RUNTIME = 'RUNTIME'
}

export enum MessageScope {
  SYSTEM = 'SYSTEM'
}

export enum RuntimeMessageType {
  SYSTEM_MESSAGE = 'SYSTEM_MESSAGE',
  CORE_MESSAGE = 'CORE_MESSAGE',
  APPLICATION_MESSAGE = 'APPLICATION_MESSAGE',
  PLUGIN_MESSAGE = 'PLUGIN_MESSAGE',
  FIELD_MESSAGE = 'FIELD_MESSAGE'
}

export enum MessageLifecycleState {
  CREATED = 'CREATED',
  READY = 'READY',
  WAITING = 'WAITING',
  SEALED = 'SEALED',
  TERMINATED = 'TERMINATED'
}

export enum MessageCapability {
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION',
  PLUGIN = 'PLUGIN',
  FIELD = 'FIELD',
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  DISTRIBUTED = 'DISTRIBUTED',
  INTER_PROCESS = 'INTER_PROCESS',
  INTER_NODE = 'INTER_NODE',
  AI = 'AI',
  WORKFLOW = 'WORKFLOW',
  MONITORING = 'MONITORING'
}

export enum MessageCategory {
  CONTROL = 'CONTROL',
  COMMAND = 'COMMAND',
  EVENT = 'EVENT',
  REQUEST = 'REQUEST',
  RESPONSE = 'RESPONSE',
  DATA = 'DATA',
  SYSTEM = 'SYSTEM',
  APPLICATION = 'APPLICATION',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageDirectionPolicy {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  INTERNAL = 'INTERNAL',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageFormatPolicy {
  JSON = 'JSON',
  BINARY = 'BINARY',
  PROTOBUF = 'PROTOBUF',
  MSGPACK = 'MSGPACK',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageValidationPolicy {
  NONE = 'NONE',
  HEADER_ONLY = 'HEADER_ONLY',
  SCHEMA = 'SCHEMA',
  FULL = 'FULL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageExecutionPolicy {
  READ_ONLY = 'READ_ONLY',
  DETERMINISTIC = 'DETERMINISTIC',
  IMMUTABLE_SCHEMA = 'IMMUTABLE_SCHEMA',
  NO_THREAD = 'NO_THREAD',
  NO_QUEUE = 'NO_QUEUE',
  NO_TASK = 'NO_TASK',
  NO_WORKER = 'NO_WORKER',
  NO_DISPATCHER = 'NO_DISPATCHER',
  NO_EVENT = 'NO_EVENT',
  NO_EVENT_BUS = 'NO_EVENT_BUS',
  NO_ROUTER = 'NO_ROUTER',
  NO_TRANSPORT = 'NO_TRANSPORT',
  NO_CONNECTION = 'NO_CONNECTION',
  NO_PROTOCOL = 'NO_PROTOCOL',
  NO_SESSION = 'NO_SESSION',
  NO_PACKET = 'NO_PACKET',
  NO_FRAME = 'NO_FRAME',
  NO_MESSAGE_BUILD = 'NO_MESSAGE_BUILD',
  NO_MESSAGE_PARSE = 'NO_MESSAGE_PARSE',
  NO_MESSAGE_SEND = 'NO_MESSAGE_SEND',
  NO_MESSAGE_RECEIVE = 'NO_MESSAGE_RECEIVE',
  NO_REPLY = 'NO_REPLY',
  NO_FORWARD = 'NO_FORWARD',
  NO_ROUTE = 'NO_ROUTE',
  NO_DISPATCH = 'NO_DISPATCH'
}

export enum MessageDependencyPolicy {
  NO_DEPENDENCY = 'NO_DEPENDENCY',
  STATIC_DEPENDENCY = 'STATIC_DEPENDENCY',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageTopology {
  LOCAL = 'LOCAL',
  PROCESS = 'PROCESS',
  NODE = 'NODE',
  CLUSTER = 'CLUSTER',
  DISTRIBUTED = 'DISTRIBUTED'
}

export enum MessagePriorityPolicy {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageDeliveryPolicy {
  UNICAST = 'UNICAST',
  MULTICAST = 'MULTICAST',
  BROADCAST = 'BROADCAST',
  DIRECT = 'DIRECT',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export enum MessageReliabilityPolicy {
  BEST_EFFORT = 'BEST_EFFORT',
  AT_MOST_ONCE = 'AT_MOST_ONCE',
  AT_LEAST_ONCE = 'AT_LEAST_ONCE',
  EXACTLY_ONCE = 'EXACTLY_ONCE',
  SCHEMA_ONLY = 'SCHEMA_ONLY'
}

export interface RuntimeMessageMetadata {
  readonly id: string;
  readonly name: string;
  readonly messageModelVersion: string;
  readonly messageSchemaVersion: string;
  readonly description: string;
}

export interface RuntimeMessageModel {
  readonly messageType: RuntimeMessageType;
  readonly modelId: string;
  readonly metadata: RuntimeMessageMetadata;
  readonly messageOrder: number;
  readonly supportedCapabilities: readonly MessageCapability[];
  readonly supportedMessagePolicies: readonly string[];
  readonly supportedFormatPolicies: readonly MessageFormatPolicy[];
  readonly supportedValidationPolicies: readonly MessageValidationPolicy[];
  readonly supportedDirectionPolicies: readonly MessageDirectionPolicy[];
  readonly dependencyPolicy: MessageDependencyPolicy;
  readonly topology: MessageTopology;
  readonly lifecycleStates: readonly MessageLifecycleState[];
  readonly executionPolicies: readonly MessageExecutionPolicy[];
  readonly allowedSteps: readonly string[];
  readonly supportedConnectionPolicies: readonly string[];
  readonly supportedTransportPolicies: readonly string[];
  readonly supportedProtocolPolicies: readonly string[];
  readonly supportedSessionPolicies: readonly string[];
  readonly supportedPacketPolicies: readonly string[];
  readonly supportedFramePolicies: readonly string[];
  readonly supportedPriorityPolicies: readonly MessagePriorityPolicy[];
  readonly supportedDeliveryPolicies: readonly MessageDeliveryPolicy[];
  readonly supportedReliabilityPolicies: readonly MessageReliabilityPolicy[];
}

export interface MessageMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly layer: string;
  readonly category: string;
}

export interface ExecutionRuntimeMessageContext {
  readonly runtimeMessageId: string;
}

export interface ExecutionRuntimeMessageData {
  readonly managerType: MessageType;
  readonly managerScope: MessageScope;
  readonly messageModels: readonly RuntimeMessageModel[];
}

export interface ExecutionRuntimeMessage {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly context: ExecutionRuntimeMessageContext;
  readonly metadata: MessageMetadata;
  readonly data: ExecutionRuntimeMessageData;
}

export interface ExecutionRuntimeMessageBlueprint {
  getExecutionRuntimeMessage(): ExecutionRuntimeMessage;
  getMetadata(): MessageMetadata;
  getContext(): ExecutionRuntimeMessageContext;
  getData(): ExecutionRuntimeMessageData;
  getMessageModels(): readonly RuntimeMessageModel[];
  getMessageSequence(): readonly string[];
}

// 1. 静的実行ステップシーケンスの定義と凍結
export const MESSAGE_SEQUENCE: readonly string[] = Object.freeze([
  'REGISTER_MESSAGE',
  'VALIDATE_MESSAGE_SCHEMA',
  'INITIALIZE_MESSAGE_BLUEPRINT',
  'READY_FOR_MESSAGE_RUNTIME',
  'MESSAGE_SCHEMA_CONFIRMED'
]);

// 静的ポリシーリストの定義と凍結
const defaultPolicies: readonly MessageExecutionPolicy[] = Object.freeze([
  MessageExecutionPolicy.READ_ONLY,
  MessageExecutionPolicy.DETERMINISTIC,
  MessageExecutionPolicy.IMMUTABLE_SCHEMA,
  MessageExecutionPolicy.NO_THREAD,
  MessageExecutionPolicy.NO_QUEUE,
  MessageExecutionPolicy.NO_TASK,
  MessageExecutionPolicy.NO_WORKER,
  MessageExecutionPolicy.NO_DISPATCHER,
  MessageExecutionPolicy.NO_EVENT,
  MessageExecutionPolicy.NO_EVENT_BUS,
  MessageExecutionPolicy.NO_ROUTER,
  MessageExecutionPolicy.NO_TRANSPORT,
  MessageExecutionPolicy.NO_CONNECTION,
  MessageExecutionPolicy.NO_PROTOCOL,
  MessageExecutionPolicy.NO_SESSION,
  MessageExecutionPolicy.NO_PACKET,
  MessageExecutionPolicy.NO_FRAME,
  MessageExecutionPolicy.NO_MESSAGE_BUILD,
  MessageExecutionPolicy.NO_MESSAGE_PARSE,
  MessageExecutionPolicy.NO_MESSAGE_SEND,
  MessageExecutionPolicy.NO_MESSAGE_RECEIVE,
  MessageExecutionPolicy.NO_REPLY,
  MessageExecutionPolicy.NO_FORWARD,
  MessageExecutionPolicy.NO_ROUTE,
  MessageExecutionPolicy.NO_DISPATCH
]);

// 静的ライフサイクル状態リストの定義と凍結
const defaultLifecycleStates: readonly MessageLifecycleState[] = Object.freeze([
  MessageLifecycleState.CREATED,
  MessageLifecycleState.READY,
  MessageLifecycleState.WAITING,
  MessageLifecycleState.SEALED,
  MessageLifecycleState.TERMINATED
]);

// 2. 静的メッセージモデルリストの定義と凍結
export const RUNTIME_MESSAGE_MODELS: readonly RuntimeMessageModel[] = Object.freeze([
  Object.freeze({
    messageType: RuntimeMessageType.SYSTEM_MESSAGE,
    modelId: 'message-model-system-01',
    metadata: Object.freeze({
      id: 'message-meta-system-01',
      name: 'System Message Metadata',
      messageModelVersion: '1.0',
      messageSchemaVersion: '1.0',
      description: 'Metadata for System Message Schema'
    }),
    messageOrder: 1,
    supportedCapabilities: Object.freeze([MessageCapability.SYSTEM, MessageCapability.REMOTE, MessageCapability.LOCAL]),
    supportedMessagePolicies: Object.freeze(['StaticRouting']),
    supportedFormatPolicies: Object.freeze([MessageFormatPolicy.JSON, MessageFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageValidationPolicy.SCHEMA_ONLY]),
    supportedDirectionPolicies: Object.freeze([MessageDirectionPolicy.INTERNAL, MessageDirectionPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageDependencyPolicy.NO_DEPENDENCY,
    topology: MessageTopology.LOCAL,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedFramePolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPriorityPolicies: Object.freeze([MessagePriorityPolicy.HIGH, MessagePriorityPolicy.SCHEMA_ONLY]),
    supportedDeliveryPolicies: Object.freeze([MessageDeliveryPolicy.UNICAST, MessageDeliveryPolicy.SCHEMA_ONLY]),
    supportedReliabilityPolicies: Object.freeze([MessageReliabilityPolicy.EXACTLY_ONCE, MessageReliabilityPolicy.SCHEMA_ONLY])
  }),
  Object.freeze({
    messageType: RuntimeMessageType.CORE_MESSAGE,
    modelId: 'message-model-core-01',
    metadata: Object.freeze({
      id: 'message-meta-core-01',
      name: 'Core Message Metadata',
      messageModelVersion: '1.0',
      messageSchemaVersion: '1.0',
      description: 'Metadata for Core Message Schema'
    }),
    messageOrder: 2,
    supportedCapabilities: Object.freeze([MessageCapability.SYSTEM, MessageCapability.APPLICATION, MessageCapability.INTER_PROCESS]),
    supportedMessagePolicies: Object.freeze([]),
    supportedFormatPolicies: Object.freeze([MessageFormatPolicy.BINARY, MessageFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageValidationPolicy.HEADER_ONLY, MessageValidationPolicy.SCHEMA_ONLY]),
    supportedDirectionPolicies: Object.freeze([MessageDirectionPolicy.BIDIRECTIONAL, MessageDirectionPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageDependencyPolicy.STATIC_DEPENDENCY,
    topology: MessageTopology.PROCESS,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedFramePolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPriorityPolicies: Object.freeze([MessagePriorityPolicy.NORMAL, MessagePriorityPolicy.SCHEMA_ONLY]),
    supportedDeliveryPolicies: Object.freeze([MessageDeliveryPolicy.DIRECT, MessageDeliveryPolicy.SCHEMA_ONLY]),
    supportedReliabilityPolicies: Object.freeze([MessageReliabilityPolicy.AT_MOST_ONCE, MessageReliabilityPolicy.SCHEMA_ONLY])
  }),
  Object.freeze({
    messageType: RuntimeMessageType.APPLICATION_MESSAGE,
    modelId: 'message-model-app-01',
    metadata: Object.freeze({
      id: 'message-meta-app-01',
      name: 'Application Message Metadata',
      messageModelVersion: '1.0',
      messageSchemaVersion: '1.0',
      description: 'Metadata for Application Message Schema'
    }),
    messageOrder: 3,
    supportedCapabilities: Object.freeze([MessageCapability.APPLICATION, MessageCapability.AI, MessageCapability.WORKFLOW, MessageCapability.DISTRIBUTED, MessageCapability.INTER_NODE]),
    supportedMessagePolicies: Object.freeze(['DynamicRouting']),
    supportedFormatPolicies: Object.freeze([MessageFormatPolicy.JSON, MessageFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageValidationPolicy.FULL, MessageValidationPolicy.SCHEMA_ONLY]),
    supportedDirectionPolicies: Object.freeze([MessageDirectionPolicy.INBOUND, MessageDirectionPolicy.OUTBOUND, MessageDirectionPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageDependencyPolicy.SCHEMA_ONLY,
    topology: MessageTopology.NODE,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedFramePolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPriorityPolicies: Object.freeze([MessagePriorityPolicy.NORMAL, MessagePriorityPolicy.SCHEMA_ONLY]),
    supportedDeliveryPolicies: Object.freeze([MessageDeliveryPolicy.UNICAST, MessageDeliveryPolicy.SCHEMA_ONLY]),
    supportedReliabilityPolicies: Object.freeze([MessageReliabilityPolicy.AT_LEAST_ONCE, MessageReliabilityPolicy.SCHEMA_ONLY])
  }),
  Object.freeze({
    messageType: RuntimeMessageType.PLUGIN_MESSAGE,
    modelId: 'message-model-plugin-01',
    metadata: Object.freeze({
      id: 'message-meta-plugin-01',
      name: 'Plugin Message Metadata',
      messageModelVersion: '1.0',
      messageSchemaVersion: '1.0',
      description: 'Metadata for Plugin Message Schema'
    }),
    messageOrder: 4,
    supportedCapabilities: Object.freeze([MessageCapability.PLUGIN, MessageCapability.MONITORING]),
    supportedMessagePolicies: Object.freeze([]),
    supportedFormatPolicies: Object.freeze([MessageFormatPolicy.MSGPACK, MessageFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageValidationPolicy.SCHEMA, MessageValidationPolicy.SCHEMA_ONLY]),
    supportedDirectionPolicies: Object.freeze([MessageDirectionPolicy.INTERNAL, MessageDirectionPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageDependencyPolicy.NO_DEPENDENCY,
    topology: MessageTopology.CLUSTER,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedFramePolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPriorityPolicies: Object.freeze([MessagePriorityPolicy.LOW, MessagePriorityPolicy.SCHEMA_ONLY]),
    supportedDeliveryPolicies: Object.freeze([MessageDeliveryPolicy.MULTICAST, MessageDeliveryPolicy.SCHEMA_ONLY]),
    supportedReliabilityPolicies: Object.freeze([MessageReliabilityPolicy.BEST_EFFORT, MessageReliabilityPolicy.SCHEMA_ONLY])
  }),
  Object.freeze({
    messageType: RuntimeMessageType.FIELD_MESSAGE,
    modelId: 'message-model-field-01',
    metadata: Object.freeze({
      id: 'message-meta-field-01',
      name: 'Field Message Metadata',
      messageModelVersion: '1.0',
      messageSchemaVersion: '1.0',
      description: 'Metadata for Field Message Schema'
    }),
    messageOrder: 5,
    supportedCapabilities: Object.freeze([MessageCapability.FIELD]),
    supportedMessagePolicies: Object.freeze([]),
    supportedFormatPolicies: Object.freeze([MessageFormatPolicy.JSON, MessageFormatPolicy.SCHEMA_ONLY]),
    supportedValidationPolicies: Object.freeze([MessageValidationPolicy.FULL, MessageValidationPolicy.SCHEMA_ONLY]),
    supportedDirectionPolicies: Object.freeze([MessageDirectionPolicy.BIDIRECTIONAL, MessageDirectionPolicy.SCHEMA_ONLY]),
    dependencyPolicy: MessageDependencyPolicy.NO_DEPENDENCY,
    topology: MessageTopology.DISTRIBUTED,
    lifecycleStates: defaultLifecycleStates,
    executionPolicies: defaultPolicies,
    allowedSteps: MESSAGE_SEQUENCE,
    supportedConnectionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedTransportPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedProtocolPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedSessionPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPacketPolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedFramePolicies: Object.freeze(['SCHEMA_ONLY']),
    supportedPriorityPolicies: Object.freeze([MessagePriorityPolicy.CRITICAL, MessagePriorityPolicy.SCHEMA_ONLY]),
    supportedDeliveryPolicies: Object.freeze([MessageDeliveryPolicy.BROADCAST, MessageDeliveryPolicy.SCHEMA_ONLY]),
    supportedReliabilityPolicies: Object.freeze([MessageReliabilityPolicy.EXACTLY_ONCE, MessageReliabilityPolicy.SCHEMA_ONLY])
  })
]);

// 3. メタデータオブジェクトの作成と凍結
const messageMetadata: MessageMetadata = Object.freeze({
  id: 'runtime-message-meta-01',
  name: 'Execution Runtime Message Metadata',
  version: '1.0.0',
  description: 'Metadata for Execution Runtime Message Foundation',
  layer: 'Message Layer',
  category: 'Infrastructure'
});

// 4. コンテキストオブジェクトの作成と凍結 (ID 参照のみ、runtimeMessageId のみ)
const messageContext: ExecutionRuntimeMessageContext = Object.freeze({
  runtimeMessageId: 'runtime-message-01'
});

// 5. データオブジェクトの作成と凍結
const messageData: ExecutionRuntimeMessageData = Object.freeze({
  managerType: MessageType.FOUNDATION,
  managerScope: MessageScope.SYSTEM,
  messageModels: RUNTIME_MESSAGE_MODELS
});

// 6. メッセージマネージャーオブジェクト本体の作成と凍結
const runtimeMessageData: ExecutionRuntimeMessage = Object.freeze({
  id: 'runtime-message-01',
  name: 'Default Execution Runtime Message Foundation',
  description: 'The static execution runtime message structure definition',
  context: messageContext,
  metadata: messageMetadata,
  data: messageData
});

// Blueprint コンテナの不変シングルトンインスタンス実装 (型固定の適用)
export const EXECUTION_RUNTIME_MESSAGE_BLUEPRINT: Readonly<ExecutionRuntimeMessageBlueprint> = Object.freeze({
  getExecutionRuntimeMessage(): ExecutionRuntimeMessage {
    return runtimeMessageData;
  },

  getMetadata(): MessageMetadata {
    return runtimeMessageData.metadata;
  },

  getContext(): ExecutionRuntimeMessageContext {
    return runtimeMessageData.context;
  },

  getData(): ExecutionRuntimeMessageData {
    return runtimeMessageData.data;
  },

  getMessageModels(): readonly RuntimeMessageModel[] {
    return RUNTIME_MESSAGE_MODELS;
  },

  getMessageSequence(): readonly string[] {
    return MESSAGE_SEQUENCE;
  }
});
