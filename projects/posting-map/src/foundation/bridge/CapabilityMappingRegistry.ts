import { VerificationCapabilityType } from '../../../../../sdk/verification/VerificationCapabilityModel';
import { ExecutionTaskPriority } from '../../../../../sdk/execution/ExecutionTaskModel';

export interface CapabilityMappingConfig {
  readonly priority: ExecutionTaskPriority;
  readonly capabilities: readonly VerificationCapabilityType[];
}

export class CapabilityMappingRegistry {
  private static mappings: Map<string, CapabilityMappingConfig> = new Map([
    [
      'ORDER_CREATED',
      {
        priority: ExecutionTaskPriority.HIGH,
        capabilities: [
          VerificationCapabilityType.API_ACCESS,
          VerificationCapabilityType.FILE_ACCESS
        ]
      }
    ],
    [
      'ORDER_PROCESSING_REQUEST',
      {
        priority: ExecutionTaskPriority.HIGH,
        capabilities: [
          VerificationCapabilityType.API_ACCESS,
          VerificationCapabilityType.FILE_ACCESS
        ]
      }
    ],
    [
      'DISTRIBUTION_ACTIVITY_COMPLETED',
      {
        priority: ExecutionTaskPriority.NORMAL,
        capabilities: [
          VerificationCapabilityType.API_ACCESS,
          VerificationCapabilityType.FILE_ACCESS
        ]
      }
    ],
    [
      'GPS_EVIDENCE_REJECTED',
      {
        priority: ExecutionTaskPriority.HIGH,
        capabilities: [
          VerificationCapabilityType.BROWSER_AUTOMATION,
          VerificationCapabilityType.SCREENSHOT,
          VerificationCapabilityType.DOM_INSPECTION
        ]
      }
    ],
    [
      'PHOTO_EVIDENCE_REJECTED',
      {
        priority: ExecutionTaskPriority.HIGH,
        capabilities: [
          VerificationCapabilityType.BROWSER_AUTOMATION,
          VerificationCapabilityType.SCREENSHOT
        ]
      }
    ],
    [
      'FLYER_SHORTAGE_WARNING',
      {
        priority: ExecutionTaskPriority.NORMAL,
        capabilities: [
          VerificationCapabilityType.API_ACCESS
        ]
      }
    ],
    [
      'FLYER_OUT_OF_STOCK',
      {
        priority: ExecutionTaskPriority.HIGH,
        capabilities: [
          VerificationCapabilityType.API_ACCESS
        ]
      }
    ],
    [
      'API_EXECUTION_REQUEST',
      {
        priority: ExecutionTaskPriority.NORMAL,
        capabilities: [
          VerificationCapabilityType.API_ACCESS
        ]
      }
    ]
  ]);

  private static defaultMapping: CapabilityMappingConfig = {
    priority: ExecutionTaskPriority.NORMAL,
    capabilities: [VerificationCapabilityType.API_ACCESS]
  };

  public static registerMapping(eventType: string, config: CapabilityMappingConfig): void {
    CapabilityMappingRegistry.mappings.set(eventType.trim(), config);
  }

  public static getMapping(eventType: string): CapabilityMappingConfig {
    if (!eventType) {
      return CapabilityMappingRegistry.defaultMapping;
    }
    const found = CapabilityMappingRegistry.mappings.get(eventType.trim());
    return found || CapabilityMappingRegistry.defaultMapping;
  }

  public static setDefaultMapping(config: CapabilityMappingConfig): void {
    CapabilityMappingRegistry.defaultMapping = config;
  }
}
