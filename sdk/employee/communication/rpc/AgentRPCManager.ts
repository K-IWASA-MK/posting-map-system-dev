import { AIMessage } from '../types/AIMessage';
import { RPCTimeoutException } from '../exceptions/AICommunicationExceptions';

export type RPCProcedure = (requestPayload: any) => Promise<any>;

export class AgentRPCManager {
  private procedures: Map<string, RPCProcedure> = new Map();

  public registerProcedure(procedureName: string, procedure: RPCProcedure): void {
    this.procedures.set(procedureName, procedure);
  }

  public async callRPC(procedureName: string, payload: any, timeoutMs: number = 30000): Promise<any> {
    const procedure = this.procedures.get(procedureName);
    if (!procedure) {
      throw new Error(`RPC Procedure '${procedureName}' not registered.`);
    }

    const timer = new Promise((_, reject) => {
      setTimeout(() => reject(new RPCTimeoutException(`RPC '${procedureName}' timed out after ${timeoutMs}ms.`)), timeoutMs);
    });

    const execution = procedure(payload);
    return await Promise.race([execution, timer]);
  }
}
