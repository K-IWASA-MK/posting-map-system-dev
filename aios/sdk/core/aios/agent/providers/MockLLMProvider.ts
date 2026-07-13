import { ILLMProvider, LLMRequest, LLMResponse } from './ILLMProvider';

export class MockLLMProvider implements ILLMProvider {
    name = 'MockLLMProvider';
    capabilities = ['CAN_JSON_MODE'];

    public async generate(request: LLMRequest): Promise<LLMResponse> {
        // Return a mock response
        return {
            content: `Mocked response for prompt: ${request.prompt.substring(0, 20)}...`,
            usage: {
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30
            },
            model: 'mock-model-v1'
        };
    }
}
