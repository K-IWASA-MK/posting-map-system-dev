import { AIOSMessageBus, MessageHandler } from './bus/AIOSMessageBus';
import { AgentRPCManager, RPCProcedure } from './rpc/AgentRPCManager';
import { CommunicationRecoveryManager } from './recovery/CommunicationRecoveryManager';
import { AIMessage } from './types/AIMessage';
import { DeadLetterQueue } from './dlq/DeadLetterQueue';

export class AIEmployeeCommunicationManager {
  private static instance: AIEmployeeCommunicationManager | null = null;
  private messageBus: AIOSMessageBus;
  private rpcManager: AgentRPCManager;
  private recoveryManager: CommunicationRecoveryManager;

  private constructor() {
    this.messageBus = new AIOSMessageBus();
    this.rpcManager = new AgentRPCManager();
    this.recoveryManager = new CommunicationRecoveryManager();
  }

  public static getInstance(): AIEmployeeCommunicationManager {
    if (!AIEmployeeCommunicationManager.instance) {
      AIEmployeeCommunicationManager.instance = new AIEmployeeCommunicationManager();
    }
    return AIEmployeeCommunicationManager.instance;
  }

  public static resetInstance(): void {
    AIEmployeeCommunicationManager.instance = null;
  }

  public subscribe(channelId: string, handler: MessageHandler): void {
    this.messageBus.subscribe(channelId, handler);
  }

  public async publish(channelId: string, message: AIMessage): Promise<boolean> {
    return await this.messageBus.publish(channelId, message);
  }

  public registerRPC(procedureName: string, procedure: RPCProcedure): void {
    this.rpcManager.registerProcedure(procedureName, procedure);
  }

  public async callRPC(procedureName: string, payload: any, timeoutMs?: number): Promise<any> {
    return await this.rpcManager.callRPC(procedureName, payload, timeoutMs);
  }

  public getDLQ(): DeadLetterQueue {
    return this.messageBus.getDLQ();
  }

  public async recover(): Promise<boolean> {
    return await this.recoveryManager.performRecoverySequence(this.messageBus);
  }
}
