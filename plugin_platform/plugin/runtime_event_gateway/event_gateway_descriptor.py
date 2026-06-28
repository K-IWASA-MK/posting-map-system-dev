class EventGatewayDescriptor:
    def __init__(self, gateway_id: str, event_id: str, plugin_id: str, gateway_type: str, metadata: dict, trace_id: str):
        self.gateway_id = gateway_id
        self.event_id = event_id
        self.plugin_id = plugin_id
        self.gateway_type = gateway_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "gateway_id": self.gateway_id,
            "event_id": self.event_id,
            "plugin_id": self.plugin_id,
            "gateway_type": self.gateway_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
