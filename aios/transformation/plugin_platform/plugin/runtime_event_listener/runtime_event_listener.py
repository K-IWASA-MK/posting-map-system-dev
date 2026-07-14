from plugin_platform.plugin.runtime_event_gateway import RuntimeEventGateway

class RuntimeEventListener:
    def __init__(self, listener_id: str, runtime_event_gateway: RuntimeEventGateway, listener_type: str, listening_events: list, metadata: dict, trace_id: str):
        self.listener_id = listener_id
        self.runtime_event_gateway = runtime_event_gateway
        self.listener_type = listener_type
        self.listening_events = listening_events
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "listener_id": self.listener_id,
            "runtime_event_gateway": self.runtime_event_gateway.to_dict() if hasattr(self.runtime_event_gateway, "to_dict") else self.runtime_event_gateway,
            "listener_type": self.listener_type,
            "listening_events": self.listening_events,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventListener":
        gateway_data = data.get("runtime_event_gateway")
        if isinstance(gateway_data, dict):
            from plugin_platform.plugin.runtime_event_gateway.runtime_event_gateway import RuntimeEventGateway
            gateway_obj = RuntimeEventGateway.from_dict(gateway_data)
        else:
            gateway_obj = gateway_data
            
        return cls(
            listener_id=data.get("listener_id"),
            runtime_event_gateway=gateway_obj,
            listener_type=data.get("listener_type"),
            listening_events=data.get("listening_events", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

