from plugin_platform.plugin.runtime_event_receiver import RuntimeEventReceiver

class RuntimeEventGateway:
    def __init__(self, gateway_id: str, runtime_event_receiver: RuntimeEventReceiver, gateway_type: str, forwarded_events: list, metadata: dict, trace_id: str):
        self.gateway_id = gateway_id
        self.runtime_event_receiver = runtime_event_receiver
        self.gateway_type = gateway_type
        self.forwarded_events = forwarded_events
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "gateway_id": self.gateway_id,
            "runtime_event_receiver": self.runtime_event_receiver.to_dict() if hasattr(self.runtime_event_receiver, "to_dict") else self.runtime_event_receiver,
            "gateway_type": self.gateway_type,
            "forwarded_events": self.forwarded_events,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
