class RuntimeEventExecutionFlow:
    def __init__(self, execution_flow_id: str, execution_plan_id: str, execution_state: str, execution_sequence: list, metadata: dict, trace_id: str):
        self.execution_flow_id = execution_flow_id
        self.execution_plan_id = execution_plan_id
        self.execution_state = execution_state
        self.execution_sequence = execution_sequence
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "execution_flow_id": self.execution_flow_id,
            "execution_plan_id": self.execution_plan_id,
            "execution_state": self.execution_state,
            "execution_sequence": self.execution_sequence,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionFlow":
        return cls(
            execution_flow_id=data.get("execution_flow_id"),
            execution_plan_id=data.get("execution_plan_id"),
            execution_state=data.get("execution_state"),
            execution_sequence=data.get("execution_sequence", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

