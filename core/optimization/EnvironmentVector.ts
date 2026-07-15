export interface EnvironmentVector {
  readonly eventDensity: number;
  readonly runtimeLoad: number;
  readonly cpuPressure: number;
  readonly memoryPressure: number;
  readonly executionLatency: number;
  readonly graphComplexity: number;
  readonly governancePressure: number;
  readonly optimizationDebt: number;
  readonly systemEntropy: number;
  readonly qualityScore: number;
  readonly trustScore: number;
  readonly runtimeHealth: number;
}
