export interface Goal {
    goalId: string;
    description: string;
    targetCompletionAt?: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}
