from typing import List
from .execution_step import ExecutionStep

class ExecutionPlan:
    def __init__(self, plan_id: str, steps: List[ExecutionStep], created_at: str, trigger: str, metadata: dict):
        self.plan_id = plan_id
        self.steps = steps
        self.created_at = created_at
        self.trigger = trigger
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "plan_id": self.plan_id,
            "steps": [step.to_dict() for step in self.steps],
            "created_at": self.created_at,
            "trigger": self.trigger,
            "metadata": self.metadata
        }
