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

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventHandler":
        endpoint_data = data.get("runtime_event_endpoint")
        if isinstance(endpoint_data, dict):
            from plugin_platform.plugin.runtime_event_endpoint.runtime_event_endpoint import RuntimeEventEndpoint
            endpoint_obj = RuntimeEventEndpoint.from_dict(endpoint_data)
        else:
            endpoint_obj = endpoint_data
            
        return cls(
            handler_id=data.get("handler_id"),
            runtime_event_endpoint=endpoint_obj,
            handler_type=data.get("handler_type"),
            handler_actions=data.get("handler_actions", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

