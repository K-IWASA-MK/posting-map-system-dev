import { CapacityMonitor } from "./CapacityMonitor";
import { ResourcePool } from "./ResourcePool";
import { ResourceHealth } from "./ResourceHealth";

export class MockCapacityMonitor implements CapacityMonitor {
  constructor(private simulateError: boolean = false, private overrideTokens: number = 5000) {}

  async getAvailableCapacity(): Promise<ResourcePool> {
    if (this.simulateError) throw new Error("Capacity Check Error");
    return {
      cpuTotal: 100,
      memoryTotal: 1024,
      gpuTotal: 0,
      networkTotal: 100,
      storageTotal: 1024,
      tokenTotal: this.overrideTokens,
      costTotal: 100
    };
  }

  async getHealthStatus(): Promise<ResourceHealth> {
    if (this.simulateError) throw new Error("Health Check Error");
    return ResourceHealth.NORMAL;
  }
}
