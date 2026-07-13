class RuntimeExecutionLogStateTransition:
    def __init__(self, transition_id: str, runtime_id: str, from_state: str, to_state: str, transition_type: str, metadata: dict, trace_id: str):
        self.transition_id = transition_id
        self.runtime_id = runtime_id
        self.from_state = from_state
        self.to_state = to_state
        self.transition_type = transition_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "transition_id": self.transition_id,
            "runtime_id": self.runtime_id,
            "from_state": self.from_state,
            "to_state": self.to_state,
            "transition_type": self.transition_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogStateTransition":
        return cls(
            transition_id=data.get("transition_id"),
            runtime_id=data.get("runtime_id"),
            from_state=data.get("from_state"),
            to_state=data.get("to_state"),
            transition_type=data.get("transition_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

