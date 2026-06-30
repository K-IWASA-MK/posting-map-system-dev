class LifecycleDescriptor:
    def __init__(self, lifecycle_id: str, session_id: str, current_state: str, allowed_states: list, metadata: dict, trace_id: str):
        self.lifecycle_id = lifecycle_id
        self.session_id = session_id
        self.current_state = current_state
        self.allowed_states = allowed_states
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "lifecycle_id": self.lifecycle_id,
            "session_id": self.session_id,
            "current_state": self.current_state,
            "allowed_states": self.allowed_states,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "LifecycleDescriptor":
        return cls(
            lifecycle_id=data.get("lifecycle_id"),
            session_id=data.get("session_id"),
            current_state=data.get("current_state"),
            allowed_states=data.get("allowed_states", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

