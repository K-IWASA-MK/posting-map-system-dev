/**
 * sdk/project/index.ts
 * 
 * Project Bridge Foundation module exports
 */

// Types
export * from './types/ProjectId';
export * from './types/ProjectType';
export * from './types/ProjectProfile';
export * from './types/ProjectMetadata';

// Capability & Policy
export * from './capability/types/ProjectCapability';
export * from './policy/types/ProjectPolicy';

// Registry
export * from './registry/ProjectRegistry';

// Context
export * from './context/types/ProjectContext';
export * from './context/ProjectContextResolver';

// Intake
export * from './intake/types/ProjectTaskRequest';
export * from './intake/types/ProjectTaskResponse';
export * from './intake/TaskIntakeGateway';

// Workflow Request
export * from './workflow/types/WorkflowRequest';
export * from './workflow/WorkflowRequestBuilder';

// Result & Artifacts
export * from './artifact/types/ArtifactReference';
export * from './result/types/ProjectResult';
export * from './result/types/ProjectCallback';
export * from './result/ResultBuilder';

// Events
export * from './event/types/ProjectEventType';
export * from './event/types/ProjectEvent';
export * from './event/ProjectEventPublisher';

// Adapters
export * from './adapter/interfaces/IProjectAdapter';
export * from './adapter/FieldOperationsAdapter';
export * from './adapter/HokuseiChAdapter';
export * from './adapter/AiSecretaryAdapter';

// Bridge Runtime
export * from './bridge/interfaces/ProjectBridge';
export * from './bridge/ProjectBridgeRuntime';

// Catalog & Bootstrap
export * from './catalog/StandardProjectCatalog';
export * from './bootstrap/ProjectBootstrap';
