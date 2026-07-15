import { PromptRegistry, PromptTemplate } from '../PromptRegistry';
import { AgentContext } from '../AgentContext';

export class PromptService {
    constructor(private registry: PromptRegistry) {}

    public buildPrompt(promptId: string, context: AgentContext, additionalVars?: Record<string, any>): string {
        const template = this.registry.getPrompt(promptId);
        if (!template) {
            throw new Error(`Prompt template ${promptId} not found`);
        }

        let content = template.content;
        const vars = { ...context.variables, ...additionalVars };

        // Simple variable substitution
        for (const [key, value] of Object.entries(vars)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, String(value));
        }

        return content;
    }
}
