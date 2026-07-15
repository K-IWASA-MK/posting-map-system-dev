export enum RecommendationType {
    AUTO = 'AUTO',
    MANUAL = 'MANUAL',
    HYBRID = 'HYBRID'
}

export interface RecommendationModel {
    modelId: string;
    version: string;
    description: string;
}
