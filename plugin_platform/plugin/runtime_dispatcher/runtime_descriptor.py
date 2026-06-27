class RuntimeDescriptor:
    def __init__(self, runtime_id: str, runtime_type: str, version: int, capabilities: list, priority: int, metadata: dict, trace_id: str):
        self.runtime_id = runtime_id
        self.runtime_type = runtime_type
        self.version = version
        self.capabilities = capabilities
        self.priority = priority
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "runtime_type": self.runtime_type,
            "version": self.version,
            "capabilities": self.capabilities,
            "priority": self.priority,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
