from plugin_platform.plugin.runtime_event_handler import RuntimeEventHandler

class RuntimeEventReceiver:
    def __init__(self, receiver_id: str, runtime_event_handler: RuntimeEventHandler, receiver_type: str, received_events: list, metadata: dict, trace_id: str):
        self.receiver_id = receiver_id
        self.runtime_event_handler = runtime_event_handler
        self.receiver_type = receiver_type
        self.received_events = received_events
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "receiver_id": self.receiver_id,
            "runtime_event_handler": self.runtime_event_handler.to_dict() if hasattr(self.runtime_event_handler, "to_dict") else self.runtime_event_handler,
            "receiver_type": self.receiver_type,
            "received_events": self.received_events,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventReceiver":
        handler_data = data.get("runtime_event_handler")
        if isinstance(handler_data, dict):
            from plugin_platform.plugin.runtime_event_handler.runtime_event_handler import RuntimeEventHandler
            handler_obj = RuntimeEventHandler.from_dict(handler_data)
        else:
            handler_obj = handler_data
            
        return cls(
            receiver_id=data.get("receiver_id"),
            runtime_event_handler=handler_obj,
            receiver_type=data.get("receiver_type"),
            received_events=data.get("received_events", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

