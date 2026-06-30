class EventReceiverDescriptor:
    def __init__(self, receiver_id: str, handler_id: str, receiver_type: str, metadata: dict, trace_id: str):
        self.receiver_id = receiver_id
        self.handler_id = handler_id
        self.receiver_type = receiver_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "receiver_id": self.receiver_id,
            "handler_id": self.handler_id,
            "receiver_type": self.receiver_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventReceiverDescriptor":
        return cls(
            receiver_id=data.get("receiver_id"),
            handler_id=data.get("handler_id"),
            receiver_type=data.get("receiver_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

