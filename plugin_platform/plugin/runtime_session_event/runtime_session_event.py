from plugin_platform.plugin.runtime_session_lifecycle import RuntimeSessionLifecycle

class RuntimeSessionEvent:
    def __init__(self, event_id: str, runtime_session_lifecycle: RuntimeSessionLifecycle, event_type: str, payload: dict, metadata: dict, trace_id: str):
        self.event_id = event_id
        self.runtime_session_lifecycle = runtime_session_lifecycle
        self.event_type = event_type
        self.payload = payload
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "event_id": self.event_id,
            "runtime_session_lifecycle": self.runtime_session_lifecycle.to_dict() if hasattr(self.runtime_session_lifecycle, "to_dict") else self.runtime_session_lifecycle,
            "event_type": self.event_type,
            "payload": self.payload,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeSessionEvent":
        lifecycle_data = data.get("runtime_session_lifecycle")
        if isinstance(lifecycle_data, dict):
            from plugin_platform.plugin.runtime_session_lifecycle.runtime_session_lifecycle import RuntimeSessionLifecycle
            lifecycle_obj = RuntimeSessionLifecycle.from_dict(lifecycle_data)
        else:
            lifecycle_obj = lifecycle_data
            
        return cls(
            event_id=data.get("event_id"),
            runtime_session_lifecycle=lifecycle_obj,
            event_type=data.get("event_type"),
            payload=data.get("payload", {}),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

