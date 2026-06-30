class EventEndpointDescriptor:
    def __init__(self, endpoint_id: str, router_id: str, endpoint_type: str, metadata: dict, trace_id: str):
        self.endpoint_id = endpoint_id
        self.router_id = router_id
        self.endpoint_type = endpoint_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "endpoint_id": self.endpoint_id,
            "router_id": self.router_id,
            "endpoint_type": self.endpoint_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventEndpointDescriptor":
        return cls(
            endpoint_id=data.get("endpoint_id"),
            router_id=data.get("router_id"),
            endpoint_type=data.get("endpoint_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

