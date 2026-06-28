class EventHandlerDescriptor:
    def __init__(self, handler_id: str, endpoint_id: str, handler_type: str, metadata: dict, trace_id: str):
        self.handler_id = handler_id
        self.endpoint_id = endpoint_id
        self.handler_type = handler_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "handler_id": self.handler_id,
            "endpoint_id": self.endpoint_id,
            "handler_type": self.handler_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
