class RuntimeInstance:
    def __init__(self, instance_id: str, runtime_id: str, status: str, configuration: dict, metadata: dict, trace_id: str):
        self.instance_id = instance_id
        self.runtime_id = runtime_id
        self.status = status
        self.configuration = configuration
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "instance_id": self.instance_id,
            "runtime_id": self.runtime_id,
            "status": self.status,
            "configuration": self.configuration,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeInstance":
        return cls(
            instance_id=data.get("instance_id"),
            runtime_id=data.get("runtime_id"),
            status=data.get("status"),
            configuration=data.get("configuration", {}),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

