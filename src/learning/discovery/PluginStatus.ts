/**
 * Defines the lifecycle status of a LearningPlugin within the Registry.
 * Used to manage enabling, disabling, or deprecating plugins dynamically.
 */
export enum PluginStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  DEPRECATED = 'DEPRECATED'
}
