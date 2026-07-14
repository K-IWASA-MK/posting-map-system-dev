from plugin_platform.plugin.runtime_event_execution_log_endpoint import RuntimeExecutionLogEndpointBoundary

class RuntimeExecutionLogReceiver:
    def __init__(self, receiver_id: str, boundary_id: str, receiver_state: str, interpretation_map: list, metadata: dict, trace_id: str):
        self.receiver_id = receiver_id
        self.boundary_id = boundary_id
        self.receiver_state = receiver_state
        self.interpretation_map = interpretation_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "receiver_id": self.receiver_id,
            "boundary_id": self.boundary_id,
            "receiver_state": self.receiver_state,
            "interpretation_map": self.interpretation_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogReceiver":
        return cls(
            receiver_id=data.get("receiver_id"),
            boundary_id=data.get("boundary_id"),
            receiver_state=data.get("receiver_state"),
            interpretation_map=data.get("interpretation_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogReceiver:
    def __init__(self, receiver_id: str, runtime_event_execution_log_endpoint_boundary: RuntimeExecutionLogEndpointBoundary, receiver: RuntimeExecutionLogReceiver, metadata: dict, trace_id: str):
        self.receiver_id = receiver_id
        self.runtime_event_execution_log_endpoint_boundary = runtime_event_execution_log_endpoint_boundary
        self.receiver = receiver
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "receiver_id": self.receiver_id,
            "runtime_event_execution_log_endpoint_boundary": self.runtime_event_execution_log_endpoint_boundary.to_dict() if hasattr(self.runtime_event_execution_log_endpoint_boundary, "to_dict") else self.runtime_event_execution_log_endpoint_boundary,
            "receiver": self.receiver.to_dict() if hasattr(self.receiver, "to_dict") else self.receiver,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogReceiver":
        boundary_data = data.get("runtime_event_execution_log_endpoint_boundary")
        if isinstance(boundary_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_endpoint.runtime_execution_log_endpoint_handler import RuntimeExecutionLogEndpointBoundary
            boundary_obj = RuntimeExecutionLogEndpointBoundary.from_dict(boundary_data)
        else:
            boundary_obj = boundary_data
            
        return cls(
            receiver_id=data.get("receiver_id"),
            runtime_event_execution_log_endpoint_boundary=boundary_obj,
            receiver=RuntimeExecutionLogReceiver.from_dict(data.get("receiver", {})) if isinstance(data.get("receiver"), dict) else data.get("receiver"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

