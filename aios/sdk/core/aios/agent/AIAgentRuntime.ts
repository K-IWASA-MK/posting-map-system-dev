import { IRuntime } from '../runtime/IRuntime';
import { RuntimeDescriptor } from '../runtime/RuntimeDescriptor';
import { RuntimeContext } from '../runtime/RuntimeContext';
import { RuntimeHealth } from '../runtime/RuntimeHealth';
import { AIAgentManifest } from './AIAgentManifest';
import { AIAgentPolicy } from './AIAgentPolicy';
import { AIAgentRegistry } from './AIAgentRegistry';
import { PromptRegistry } from './PromptRegistry';
import { AgentContext } from './AgentContext';
import { ReasoningService } from './services/ReasoningService';
import { PromptService } from './services/PromptService';
import { AgentStateMachine } from './state/AgentStateMachine';
import { AgentLedger } from './ledger/AgentLedger';
import { AgentMetrics } from './metrics/AgentMetrics';
import { AgentObservability } from './observability/AgentObservability';
import { AIOSEventBus } from '../event/AIOSEventBus';
import crypto from 'crypto';

export class AIAgentRuntime implements IRuntime<AIAgentManifest, void> {
    public readonly descriptor: RuntimeDescriptor = {
        runtimeId: 'ai-agent-runtime',
        runtimeName: 'AI Agent Runtime',
        version: 'v3.5.0-alpha.0',
        contractVersion: '1.0',
        capabilities: [
            'CAN_REVIEW' as any, 'CAN_PLAN' as any, 'CAN_REASON' as any,
            'CAN_PROPOSE' as any, 'CAN_VALIDATE' as any, 'CAN_LEARN' as any,
            'CAN_REFLECT' as any
        ],
        dependencies: []
    };

    private context?: RuntimeContext;
    private eventBus?: AIOSEventBus;
    
    private agentRegistry: AIAgentRegistry;
    private promptRegistry: PromptRegistry;
    private reasoningService: ReasoningService;
    private promptService: PromptService;
    
    private stateMachine: AgentStateMachine;
    private ledger: AgentLedger;
    private metrics: AgentMetrics;
    private observability: AgentObservability;

    constructor(
        private policy: AIAgentPolicy,
        agentRegistry: AIAgentRegistry,
        promptRegistry: PromptRegistry,
        reasoningService: ReasoningService,
        promptService: PromptService
    ) {
        this.agentRegistry = agentRegistry;
        this.promptRegistry = promptRegistry;
        this.reasoningService = reasoningService;
        this.promptService = promptService;

        this.stateMachine = new AgentStateMachine();
        this.ledger = new AgentLedger();
        this.metrics = new AgentMetrics();
        this.observability = new AgentObservability(this.metrics, this.stateMachine);
    }

    public async initialize(context: RuntimeContext): Promise<void> {
        this.context = context;
        this.eventBus = (context as any).eventBus;

        this.publishEvent('AgentStarted', { runtimeId: this.descriptor.runtimeId });
    }

    public async executeAgentTask(agentId: string, task: string, initialVariables: Record<string, any> = {}): Promise<void> {
        const agent = this.agentRegistry.getAgent(agentId);
        if (!agent) throw new Error(`Agent ${agentId} not found`);

        const conversationId = crypto.randomUUID();
        const agentContext: AgentContext = {
            conversationId,
            variables: initialVariables,
            artifacts: [],
            history: [],
            decisions: [],
            knowledge: []
        };

        try {
            this.stateMachine.transitionTo('THINKING');
            this.publishEvent('AgentThinking', { agentId, conversationId });

            const startTime = Date.now();
            this.publishEvent('AgentReasoningStarted', { agentId, conversationId });

            // Reasoning Execution
            const result = await this.reasoningService.executeReasoning(agentContext, agent.profile, task);
            
            const duration = Date.now() - startTime;
            this.metrics.recordReasoningDuration(duration);
            this.metrics.recordUsage(result.usage.promptTokens, result.usage.completionTokens);

            this.publishEvent('AgentReasoningCompleted', { agentId, conversationId, duration });

            // Record Decision
            const decisionId = crypto.randomUUID();
            const decisionRecord = {
                decisionId,
                agentId,
                contextId: conversationId,
                decisionReason: 'Derived from Reasoning',
                decisionConfidence: result.confidence,
                decisionSource: 'LLM_REASONING',
                decisionHash: crypto.createHash('sha256').update(result.finalConclusion).digest('hex'),
                timestamp: new Date().toISOString()
            };
            this.ledger.appendDecision(decisionRecord);
            agentContext.decisions.push(decisionId);

            this.publishEvent('AgentDecisionCreated', { decisionId, agentId });

            this.stateMachine.transitionTo('COMPLETED');
            this.metrics.recordSuccess();
            this.publishEvent('AgentCompleted', { agentId, conversationId, conclusion: result.finalConclusion });

        } catch (error: any) {
            this.stateMachine.transitionTo('FAILED');
            this.metrics.recordFailure();
            this.publishEvent('AgentFailed', { agentId, conversationId, error: error.message });
            throw error;
        }
    }

    private publishEvent(eventType: string, payload: any): void {
        if (this.eventBus) {
            this.eventBus.publish({
                eventId: crypto.randomUUID(),
                eventType,
                eventVersion: '1.0',
                occurredAt: new Date().toISOString(),
                producerRuntimeId: this.descriptor.runtimeId,
                correlationId: payload.conversationId || crypto.randomUUID(),
                causationId: payload.conversationId || crypto.randomUUID(),
                payload
            });
        }
    }

    public async getHealth(): Promise<RuntimeHealth> {
        const isHealthy = this.observability.checkHealth();
        return {
            status: (isHealthy ? 'HEALTHY' : 'DEGRADED') as any,
            lastCheckedAt: new Date().toISOString(),
            details: this.observability.getStatusReport()
        };
    }

    public async validate(manifest: AIAgentManifest): Promise<void> {
        if (!manifest.profile) throw new Error('Agent profile required');
    }

    public async execute(manifest: AIAgentManifest): Promise<void> {
        // Fallback generic execute
        await this.executeAgentTask(manifest.agentId, 'Generic Task');
    }

    public async pause(): Promise<void> {
        // No-op for now
    }

    public async resume(): Promise<void> {
        // No-op for now
    }

    public async shutdown(): Promise<void> {
        // Cleanup resources
    }
}
