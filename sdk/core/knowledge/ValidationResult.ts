export interface ValidationResult {
    validator: string; // e.g., 'SyntaxChecker', 'DuplicateFinder', 'AI_AGENT_Reviewer'
    score: number;     // 0.0 to 1.0
    reason: string;
    timestamp: string;
}
