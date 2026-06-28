from plugin_platform.plugin.runtime_event_router import RuntimeEventRouter

class RuntimeEventEndpoint:
    def __init__(self, endpoint_id: str, runtime_event_router: RuntimeEventRouter, endpoint_type: str, endpoint_targets: list, metadata: dict, trace_id: str):
        self.endpoint_id = endpoint_id
        self.runtime_event_router = runtime_event_router
        self.endpoint_type = endpoint_type
        self.endpoint_targets = endpoint_targets
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "endpoint_id": self.endpoint_id,
            "runtime_event_router": self.runtime_event_router.to_dict() if hasattr(self.runtime_event_router, "to_dict") else self.runtime_event_router,
            "endpoint_type": self.endpoint_type,
            "endpoint_targets": self.endpoint_targets,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
