from plugin_platform.plugin.runtime_event_dispatcher import RuntimeEventDispatcher

class RuntimeEventRouter:
    def __init__(self, router_id: str, runtime_event_dispatcher: RuntimeEventDispatcher, router_type: str, route_targets: list, metadata: dict, trace_id: str):
        self.router_id = router_id
        self.runtime_event_dispatcher = runtime_event_dispatcher
        self.router_type = router_type
        self.route_targets = route_targets
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "router_id": self.router_id,
            "runtime_event_dispatcher": self.runtime_event_dispatcher.to_dict() if hasattr(self.runtime_event_dispatcher, "to_dict") else self.runtime_event_dispatcher,
            "router_type": self.router_type,
            "route_targets": self.route_targets,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventRouter":
        disp_data = data.get("runtime_event_dispatcher")
        if isinstance(disp_data, dict):
            from plugin_platform.plugin.runtime_event_dispatcher.runtime_event_dispatcher import RuntimeEventDispatcher
            disp_obj = RuntimeEventDispatcher.from_dict(disp_data)
        else:
            disp_obj = disp_data
            
        return cls(
            router_id=data.get("router_id"),
            runtime_event_dispatcher=disp_obj,
            router_type=data.get("router_type"),
            route_targets=data.get("route_targets", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

