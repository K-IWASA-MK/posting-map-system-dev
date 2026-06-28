from plugin_platform.plugin.runtime_event_endpoint import RuntimeEventEndpoint

class RuntimeEventHandler:
    def __init__(self, handler_id: str, runtime_event_endpoint: RuntimeEventEndpoint, handler_type: str, handler_actions: list, metadata: dict, trace_id: str):
        self.handler_id = handler_id
        self.runtime_event_endpoint = runtime_event_endpoint
        self.handler_type = handler_type
        self.handler_actions = handler_actions
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "handler_id": self.handler_id,
            "runtime_event_endpoint": self.runtime_event_endpoint.to_dict() if hasattr(self.runtime_event_endpoint, "to_dict") else self.runtime_event_endpoint,
            "handler_type": self.handler_type,
            "handler_actions": self.handler_actions,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
