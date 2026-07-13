export enum EventType {
  // Execution events
  ExecutionStarted = 'ExecutionStarted',
  ExecutionCompleted = 'ExecutionCompleted',
  ExecutionFailed = 'ExecutionFailed',
  ExecutionCancelled = 'ExecutionCancelled',

  // Plugin events
  PluginStarted = 'PluginStarted',
  PluginCompleted = 'PluginCompleted',
  PluginFailed = 'PluginFailed',

  // Validation events
  ValidationStarted = 'ValidationStarted',
  ValidationCompleted = 'ValidationCompleted',
  ValidationFailed = 'ValidationFailed',

  // Review events
  ReviewStarted = 'ReviewStarted',
  ReviewCompleted = 'ReviewCompleted',
  ReviewFailed = 'ReviewFailed',

  // System events
  SystemBoot = 'SystemBoot',
  SystemReady = 'SystemReady',
  SystemShutdown = 'SystemShutdown',
  SystemError = 'SystemError',
  HealthChanged = 'HealthChanged',
}
