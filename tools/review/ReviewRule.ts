import { ReviewViolation } from './ReviewResult';

export interface ReviewContext {
  readonly taskTitle: string;
  readonly isPlatformTask: boolean; // True if it's an OS/SDK platform task (e.g. ASP-006)
  readonly proposedFiles: string[]; // List of file absolute paths proposed in the plan
  readonly planContent: string;     // Entire content of the implementation_plan.md
}

export interface ReviewRule {
  readonly id: string;
  readonly name: string;
  readonly category: 'Boundary' | 'Responsibility' | 'Ownership' | 'Policy' | 'Security' | 'Dependency';
  evaluate(context: ReviewContext): Promise<ReviewViolation[]>;
}
