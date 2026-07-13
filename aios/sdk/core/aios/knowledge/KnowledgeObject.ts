import { KnowledgeType } from './KnowledgeType';
import { KnowledgeSource } from './KnowledgeSource';
import { KnowledgeVersion } from './KnowledgeVersion';
import { ValidationResult } from './ValidationResult';

export interface KnowledgeObject {
    knowledgeId: string;
    type: KnowledgeType;
    source: KnowledgeSource;
    title: string;
    content: string; // Markdown or JSON payload
    tags: string[];
    capabilities: string[]; // List of capabilities this knowledge applies to
    runtimes: string[];     // List of runtimes this knowledge applies to
    version: KnowledgeVersion;
    validations: ValidationResult[];
    hash: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}
