import { ResourcePool } from "./ResourcePool";
import { ResourceHealth } from "./ResourceHealth";

export interface CapacityMonitor {
  getAvailableCapacity(): Promise<ResourcePool>;
  getHealthStatus(): Promise<ResourceHealth>;
}
