import { BridgeMessage } from './BridgeMessage';
import { CapabilityMappingRegistry, CapabilityMappingConfig } from './CapabilityMappingRegistry';
import { VerificationCapabilityType } from '../../../../../sdk/verification/VerificationCapabilityModel';
import { ExecutionTaskPriority } from '../../../../../sdk/execution/ExecutionTaskModel';

export class CapabilityResolver {
  public static resolve(message: BridgeMessage): CapabilityMappingConfig {
    if (message.payload) {
      const customPriority = message.payload.priority as ExecutionTaskPriority;
      const customCapabilities = message.payload.requiredCapabilities as VerificationCapabilityType[];

      if (customPriority && customCapabilities && Array.isArray(customCapabilities)) {
        return {
          priority: customPriority,
          capabilities: customCapabilities
        };
      }
    }

    return CapabilityMappingRegistry.getMapping(message.messageType);
  }
}
