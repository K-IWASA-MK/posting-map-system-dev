export interface KnowledgeContext {
  runtimeId?: string;
  projectId?: string;
  workspaceId?: string;
  pluginId?: string;
  environment?: Record<string, any>;
}
