class EventListenerDescriptor:
    def __init__(self, listener_id: str, gateway_id: str, plugin_id: str, listener_type: str, metadata: dict, trace_id: str):
        self.listener_id = listener_id
        self.gateway_id = gateway_id
        self.plugin_id = plugin_id
        self.listener_type = listener_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "listener_id": self.listener_id,
            "gateway_id": self.gateway_id,
            "plugin_id": self.plugin_id,
            "listener_type": self.listener_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
