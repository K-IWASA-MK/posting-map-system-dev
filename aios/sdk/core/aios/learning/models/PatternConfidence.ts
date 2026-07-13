export interface PatternConfidence {
    value: number; // 0.0 to 1.0
    occurrences: number;
    lastObservedAt: string;
}
