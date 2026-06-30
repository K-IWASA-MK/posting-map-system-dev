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

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventEndpoint":
        router_data = data.get("runtime_event_router")
        if isinstance(router_data, dict):
            from plugin_platform.plugin.runtime_event_router.runtime_event_router import RuntimeEventRouter
            router_obj = RuntimeEventRouter.from_dict(router_data)
        else:
            router_obj = router_data
            
        return cls(
            endpoint_id=data.get("endpoint_id"),
            runtime_event_router=router_obj,
            endpoint_type=data.get("endpoint_type"),
            endpoint_targets=data.get("endpoint_targets", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

