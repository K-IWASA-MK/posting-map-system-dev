export interface Constraint {
    constraintId: string;
    type: 'TIME' | 'RESOURCE' | 'POLICY' | 'LOGICAL';
    description: string;
    isHardConstraint: boolean;
}
