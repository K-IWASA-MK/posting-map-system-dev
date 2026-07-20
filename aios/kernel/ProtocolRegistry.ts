import * as path from 'path';
import { RootResolver } from '../../tools/review/RootResolver';

export interface ProtocolMetadata {
  readonly protocolId: string;
  readonly version: string;
  readonly compatibleVersions: readonly string[];
  readonly schemaPath: string;
}

export class ProtocolRegistry {
  private static readonly registry = new Map<string, Omit<ProtocolMetadata, 'schemaPath'> & { schemaFileName: string }>([
    ["aios-decision-v1", {
      protocolId: "aios-decision-v1",
      version: "1.0.0",
      compatibleVersions: ["^1.0.0"],
      schemaFileName: "decision-v1.json"
    }],
    ["aios-consensus-v1", {
      protocolId: "aios-consensus-v1",
      version: "1.0.0",
      compatibleVersions: ["^1.0.0"],
      schemaFileName: "consensus-v1.json"
    }],
    ["aios-capability-v1", {
      protocolId: "aios-capability-v1",
      version: "1.0.0",
      compatibleVersions: ["^1.0.0"],
      schemaFileName: "capability-v1.json"
    }],
    ["aios-ledger-v1", {
      protocolId: "aios-ledger-v1",
      version: "1.0.0",
      compatibleVersions: ["^1.0.0"],
      schemaFileName: "ledger-v1.json"
    }],
    ["aios-governance-v1", {
      protocolId: "aios-governance-v1",
      version: "1.0.0",
      compatibleVersions: ["^1.0.0"],
      schemaFileName: "governance-v1.json"
    }]
  ]);

  /**
   * Retrieves metadata for a protocol, dynamically resolving its schema path.
   */
  public static get(protocolId: string): ProtocolMetadata | undefined {
    const entry = this.registry.get(protocolId);
    if (!entry) {
      return undefined;
    }

    const workspaceRoot = RootResolver.resolveWorkspace();
    const schemaPath = path.join(workspaceRoot, 'aios', 'protocols', entry.schemaFileName);

    return {
      protocolId: entry.protocolId,
      version: entry.version,
      compatibleVersions: entry.compatibleVersions,
      schemaPath
    };
  }

  /**
   * Lists all registered protocol metadata with resolved schema paths.
   */
  public static list(): readonly ProtocolMetadata[] {
    const list: ProtocolMetadata[] = [];
    for (const key of this.registry.keys()) {
      const resolved = this.get(key);
      if (resolved) {
        list.push(resolved);
      }
    }
    return list;
  }
}
