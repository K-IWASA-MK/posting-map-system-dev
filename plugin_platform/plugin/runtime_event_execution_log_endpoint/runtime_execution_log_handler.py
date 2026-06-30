from .runtime_execution_log_endpoint import RuntimeEventExecutionLogEndpoint

class RuntimeExecutionLogHandler:
    def __init__(self, handler_id: str, endpoint_id: str, handler_state: str, handler_map: list, metadata: dict, trace_id: str):
        self.handler_id = handler_id
        self.endpoint_id = endpoint_id
        self.handler_state = handler_state
        self.handler_map = handler_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "handler_id": self.handler_id,
            "endpoint_id": self.endpoint_id,
            "handler_state": self.handler_state,
            "handler_map": self.handler_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogHandler":
        return cls(
            handler_id=data.get("handler_id"),
            endpoint_id=data.get("endpoint_id"),
            handler_state=data.get("handler_state"),
            handler_map=data.get("handler_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogHandler:
    def __init__(self, handler_id: str, runtime_event_execution_log_endpoint: RuntimeEventExecutionLogEndpoint, handler: RuntimeExecutionLogHandler, metadata: dict, trace_id: str):
        self.handler_id = handler_id
        self.runtime_event_execution_log_endpoint = runtime_event_execution_log_endpoint
        self.handler = handler
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "handler_id": self.handler_id,
            "runtime_event_execution_log_endpoint": self.runtime_event_execution_log_endpoint.to_dict() if hasattr(self.runtime_event_execution_log_endpoint, "to_dict") else self.runtime_event_execution_log_endpoint,
            "handler": self.handler.to_dict() if hasattr(self.handler, "to_dict") else self.handler,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogHandler":
        endpoint_data = data.get("runtime_event_execution_log_endpoint")
        if isinstance(endpoint_data, dict):
            from .runtime_execution_log_endpoint import RuntimeEventExecutionLogEndpoint
            endpoint_obj = RuntimeEventExecutionLogEndpoint.from_dict(endpoint_data)
        else:
            endpoint_obj = endpoint_data
            
        return cls(
            handler_id=data.get("handler_id"),
            runtime_event_execution_log_endpoint=endpoint_obj,
            handler=RuntimeExecutionLogHandler.from_dict(data.get("handler", {})) if isinstance(data.get("handler"), dict) else data.get("handler"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

