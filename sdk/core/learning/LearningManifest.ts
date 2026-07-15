export interface LearningManifest {
    sourceDataIds: string[];
    targetCapabilities: (
        'CAN_LEARN' | 
        'CAN_PROMOTE_KNOWLEDGE' | 
        'CAN_GENERATE_PATTERN' | 
        'CAN_GENERATE_RECOMMENDATION' | 
        'CAN_OPTIMIZE_WORKFLOW' | 
        'CAN_OPTIMIZE_PROMPT' | 
        'CAN_OPTIMIZE_ARCHITECTURE' | 
        'CAN_ANALYZE_FAILURE' | 
        'CAN_EXTRACT_PATTERN' | 
        'CAN_OPTIMIZE' | 
        'CAN_EVOLVE_KNOWLEDGE' | 
        'CAN_EVOLVE_PROMPT' | 
        'CAN_EVOLVE_WORKFLOW' | 
        'CAN_VALIDATE_IMPROVEMENT'
    )[];
}
