class RuntimeExecutionLogEngine:
    def __init__(self, engine_id: str, execution_plan_id: str, optimizer_id: str, engine_state: str, schedule_map: list, metadata: dict, trace_id: str):
        self.engine_id = engine_id
        self.execution_plan_id = execution_plan_id
        self.optimizer_id = optimizer_id
        self.engine_state = engine_state
        self.schedule_map = schedule_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "engine_id": self.engine_id,
            "execution_plan_id": self.execution_plan_id,
            "optimizer_id": self.optimizer_id,
            "engine_state": self.engine_state,
            "schedule_map": self.schedule_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogEngine":
        return cls(
            engine_id=data.get("engine_id"),
            execution_plan_id=data.get("execution_plan_id"),
            optimizer_id=data.get("optimizer_id"),
            engine_state=data.get("engine_state"),
            schedule_map=data.get("schedule_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

