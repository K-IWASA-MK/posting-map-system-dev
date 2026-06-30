class EventRouterDescriptor:
    def __init__(self, router_id: str, dispatcher_id: str, router_type: str, metadata: dict, trace_id: str):
        self.router_id = router_id
        self.dispatcher_id = dispatcher_id
        self.router_type = router_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "router_id": self.router_id,
            "dispatcher_id": self.dispatcher_id,
            "router_type": self.router_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventRouterDescriptor":
        return cls(
            router_id=data.get("router_id"),
            dispatcher_id=data.get("dispatcher_id"),
            router_type=data.get("router_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

