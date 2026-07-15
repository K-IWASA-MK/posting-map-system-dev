import crypto from 'crypto';

export interface PromptTemplate {
    promptId: string;
    version: string;
    content: string; // Template string with variables e.g. {{variable}}
    metadata?: Record<string, any>;
    promptHash: string; // SHA-256 hash of the content for governance
}

export class PromptRegistry {
    private templates: Map<string, PromptTemplate[]> = new Map();

    public registerPrompt(promptId: string, version: string, content: string, metadata?: Record<string, any>): PromptTemplate {
        const promptHash = crypto.createHash('sha256').update(content).digest('hex');
        const template: PromptTemplate = { promptId, version, content, metadata, promptHash };
        
        let versions = this.templates.get(promptId);
        if (!versions) {
            versions = [];
            this.templates.set(promptId, versions);
        }
        
        // Prevent duplicate version registration
        const existing = versions.find(v => v.version === version);
        if (existing) {
            throw new Error(`Prompt ${promptId} version ${version} already exists`);
        }

        versions.push(template);
        return template;
    }

    public getPrompt(promptId: string, version?: string): PromptTemplate | undefined {
        const versions = this.templates.get(promptId);
        if (!versions || versions.length === 0) return undefined;

        if (version) {
            return versions.find(v => v.version === version);
        }
        
        // Return latest version (assuming last registered is latest for now)
        return versions[versions.length - 1];
    }
}
