import { KnowledgeObject } from '../KnowledgeObject';
import { KnowledgeEvolutionService } from './KnowledgeEvolutionService';
import { ValidationResult } from '../ValidationResult';

export class PromotionService {
    constructor(private evolutionService: KnowledgeEvolutionService) {}

    public async evaluatePromotion(knowledge: KnowledgeObject): Promise<boolean> {
        const currentStatus = knowledge.version.status;
        
        if (currentStatus === 'DRAFT') {
            const hasValidations = knowledge.validations.some(v => v.score >= 0.8);
            if (hasValidations) {
                await this.evolutionService.evolve(knowledge, 'VERIFIED');
                return true;
            }
        }
        
        if (currentStatus === 'VERIFIED') {
            // Mock manual/automated approval logic
            await this.evolutionService.evolve(knowledge, 'APPROVED');
            return true;
        }

        if (currentStatus === 'APPROVED') {
            await this.evolutionService.evolve(knowledge, 'REUSABLE');
            return true;
        }

        return false;
    }
}
