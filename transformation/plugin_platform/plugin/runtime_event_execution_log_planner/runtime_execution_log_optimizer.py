class RuntimeExecutionLogOptimizer:
    def __init__(self, optimizer_id: str, plan_id: str, cost_model: dict, priority_score: dict, optimization_state: str, metadata: dict, trace_id: str):
        self.optimizer_id = optimizer_id
        self.plan_id = plan_id
        self.cost_model = cost_model
        self.priority_score = priority_score
        self.optimization_state = optimization_state
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "optimizer_id": self.optimizer_id,
            "plan_id": self.plan_id,
            "cost_model": self.cost_model,
            "priority_score": self.priority_score,
            "optimization_state": self.optimization_state,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogOptimizer":
        return cls(
            optimizer_id=data.get("optimizer_id"),
            plan_id=data.get("plan_id"),
            cost_model=data.get("cost_model", {}),
            priority_score=data.get("priority_score", {}),
            optimization_state=data.get("optimization_state"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

