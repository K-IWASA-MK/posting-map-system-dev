export interface LLMRequest {
    systemPrompt: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
}

export interface LLMResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
}

export interface ILLMProvider {
    name: string;
    capabilities: string[]; // e.g. CAN_JSON_MODE, CAN_CALL_TOOLS
    generate(request: LLMRequest): Promise<LLMResponse>;
}
