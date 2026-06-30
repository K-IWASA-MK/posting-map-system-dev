from plugin_platform.plugin.runtime_event_execution_log_routing import RuntimeEventExecutionLogRouting

class RuntimeExecutionLogEndpoint:
    def __init__(self, endpoint_id: str, routing_id: str, endpoint_state: str, endpoint_map: list, metadata: dict, trace_id: str):
        self.endpoint_id = endpoint_id
        self.routing_id = routing_id
        self.endpoint_state = endpoint_state
        self.endpoint_map = endpoint_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "endpoint_id": self.endpoint_id,
            "routing_id": self.routing_id,
            "endpoint_state": self.endpoint_state,
            "endpoint_map": self.endpoint_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogEndpoint":
        return cls(
            endpoint_id=data.get("endpoint_id"),
            routing_id=data.get("routing_id"),
            endpoint_state=data.get("endpoint_state"),
            endpoint_map=data.get("endpoint_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogEndpoint:
    def __init__(self, endpoint_id: str, runtime_event_execution_log_routing: RuntimeEventExecutionLogRouting, endpoint: RuntimeExecutionLogEndpoint, metadata: dict, trace_id: str):
        self.endpoint_id = endpoint_id
        self.runtime_event_execution_log_routing = runtime_event_execution_log_routing
        self.endpoint = endpoint
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "endpoint_id": self.endpoint_id,
            "runtime_event_execution_log_routing": self.runtime_event_execution_log_routing.to_dict() if hasattr(self.runtime_event_execution_log_routing, "to_dict") else self.runtime_event_execution_log_routing,
            "endpoint": self.endpoint.to_dict() if hasattr(self.endpoint, "to_dict") else self.endpoint,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogEndpoint":
        routing_data = data.get("runtime_event_execution_log_routing")
        if isinstance(routing_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_routing.runtime_execution_log_routing import RuntimeEventExecutionLogRouting
            routing_obj = RuntimeEventExecutionLogRouting.from_dict(routing_data)
        else:
            routing_obj = routing_data
            
        return cls(
            endpoint_id=data.get("endpoint_id"),
            runtime_event_execution_log_routing=routing_obj,
            endpoint=RuntimeExecutionLogEndpoint.from_dict(data.get("endpoint", {})) if isinstance(data.get("endpoint"), dict) else data.get("endpoint"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

