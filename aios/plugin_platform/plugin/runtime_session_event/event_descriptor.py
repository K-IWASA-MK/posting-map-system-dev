class EventDescriptor:
    def __init__(self, event_id: str, lifecycle_id: str, event_type: str, metadata: dict, trace_id: str):
        self.event_id = event_id
        self.lifecycle_id = lifecycle_id
        self.event_type = event_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "event_id": self.event_id,
            "lifecycle_id": self.lifecycle_id,
            "event_type": self.event_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventDescriptor":
        return cls(
            event_id=data.get("event_id"),
            lifecycle_id=data.get("lifecycle_id"),
            event_type=data.get("event_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

