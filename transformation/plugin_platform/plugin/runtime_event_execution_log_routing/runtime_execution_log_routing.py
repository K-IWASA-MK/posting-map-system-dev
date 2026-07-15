class RuntimeExecutionLogRouting:
    def __init__(self, routing_id: str, dispatch_id: str, routing_state: str, routing_map: list, metadata: dict, trace_id: str):
        self.routing_id = routing_id
        self.dispatch_id = dispatch_id
        self.routing_state = routing_state
        self.routing_map = routing_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "routing_id": self.routing_id,
            "dispatch_id": self.dispatch_id,
            "routing_state": self.routing_state,
            "routing_map": self.routing_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogRouting":
        return cls(
            routing_id=data.get("routing_id"),
            dispatch_id=data.get("dispatch_id"),
            routing_state=data.get("routing_state"),
            routing_map=data.get("routing_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

