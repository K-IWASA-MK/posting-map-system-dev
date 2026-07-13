class EventDispatcherDescriptor:
    def __init__(self, dispatcher_id: str, stream_id: str, dispatcher_type: str, metadata: dict, trace_id: str):
        self.dispatcher_id = dispatcher_id
        self.stream_id = stream_id
        self.dispatcher_type = dispatcher_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "dispatcher_id": self.dispatcher_id,
            "stream_id": self.stream_id,
            "dispatcher_type": self.dispatcher_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventDispatcherDescriptor":
        return cls(
            dispatcher_id=data.get("dispatcher_id"),
            stream_id=data.get("stream_id"),
            dispatcher_type=data.get("dispatcher_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

