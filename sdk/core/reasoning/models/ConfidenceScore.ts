export interface ConfidenceScore {
    value: number; // 0.0 to 1.0
    marginOfError?: number;
    calculatedAt: string;
}
