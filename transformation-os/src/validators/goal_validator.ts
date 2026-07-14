import { GoalDefinition } from '../models/goal';

export class GoalValidator {
  public static validate(goal: GoalDefinition): void {
    if (!goal.id || !goal.name) {
      throw new Error('GoalDefinition is missing id or name.');
    }
    if (!goal.priority || !goal.deadline) {
      throw new Error('GoalDefinition is missing priority or deadline.');
    }
    if (!goal.target || !goal.successMetrics || goal.successMetrics.length === 0) {
      throw new Error('GoalDefinition must have a target and at least one success metric.');
    }
  }
}
